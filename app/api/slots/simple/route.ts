import { NextRequest, NextResponse } from "next/server"
import { getAvailableSlots } from "@/lib/mock-db"

/**
 * GET /api/slots/simple?date=2025-01-15&type=type-1
 * 指定日の空き枠を取得（Supabaseなしの簡易版）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get("date")
    const consultationTypeId = searchParams.get("type")

    if (!dateStr) {
      return NextResponse.json(
        { error: "date parameter is required" },
        { status: 400 }
      )
    }

    const date = new Date(dateStr)
    const slots = getAvailableSlots(date, consultationTypeId || "")

    return NextResponse.json({ slots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    )
  }
}
