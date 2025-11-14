import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/booking/availability"
import { getConsultationType } from "@/lib/consultation-types"

export const dynamic = 'force-dynamic'

/**
 * GET /api/slots/simple?date=2025-01-15&type=1
 * 指定日の空き枠を取得（Supabaseベース）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateStr = searchParams.get("date")
    const consultationTypeId = searchParams.get("type")

    if (!dateStr) {
      return NextResponse.json(
        { error: "date parameter is required" },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)

    // 相談種別から所要時間を取得
    const consultationType = consultationTypeId
      ? getConsultationType(consultationTypeId)
      : null
    const duration = consultationType?.duration_minutes || 30

    console.log(`📅 Fetching slots for ${dateStr} (duration: ${duration}min, type: ${consultationTypeId})`)

    // Supabaseから実際の予約データをもとに空き枠を取得
    const availableSlots = await getAvailableSlots(date, duration)

    // UIで使用する形式に変換
    const slots = availableSlots.map(slot => ({
      time: slot.time.toISOString(),
      availableStaff: slot.availableStaff,
    }))

    const availableCount = slots.filter(s => s.availableStaff.length > 0).length
    console.log(`   ✅ Found ${availableCount} available slots (${slots.length} total slots)`)

    // キャッシュヘッダーを追加してパフォーマンス向上（60秒間キャッシュ）
    return NextResponse.json({ slots }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    )
  }
}
