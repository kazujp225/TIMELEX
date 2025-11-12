import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { bookingDb } from "@/lib/supabase/database"

/**
 * GET /api/staff/bookings
 * スタッフの予約一覧を取得
 *
 * クエリパラメータ:
 * - start_date: 開始日（任意）
 * - end_date: 終了日（任意）
 * - status: ステータスフィルター（任意）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams

    // デフォルトで過去30日から未来90日の範囲を取得
    const defaultStartDate = new Date()
    defaultStartDate.setDate(defaultStartDate.getDate() - 30)
    const defaultEndDate = new Date()
    defaultEndDate.setDate(defaultEndDate.getDate() + 90)

    const startDate = searchParams.get("start_date")
      ? new Date(searchParams.get("start_date")!)
      : defaultStartDate
    const endDate = searchParams.get("end_date")
      ? new Date(searchParams.get("end_date")!)
      : defaultEndDate
    const status = searchParams.get("status") || undefined

    // スタッフの予約を取得
    const bookings = await bookingDb.getByStaffAndDateRange(
      session.staffId,
      startDate,
      endDate
    )

    // ステータスでフィルター
    const filteredBookings = status
      ? bookings.filter((b) => b.status === status)
      : bookings

    // 開始時刻でソート（降順）
    filteredBookings.sort(
      (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    )

    return NextResponse.json({
      bookings: filteredBookings,
      count: filteredBookings.length,
    })
  } catch (error) {
    console.error("Error fetching staff bookings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
