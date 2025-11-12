import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { bookingDb } from "@/lib/supabase/database"

/**
 * GET /api/staff/stats
 * スタッフの統計情報を取得
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

    const now = new Date()

    // 今日の予約
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1)

    const todayBookings = await bookingDb.getByStaffAndDateRange(
      session.staffId,
      todayStart,
      todayEnd
    )

    // 今週の予約
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start from Sunday
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const weekBookings = await bookingDb.getByStaffAndDateRange(
      session.staffId,
      weekStart,
      weekEnd
    )

    // 今月の予約
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    const monthBookings = await bookingDb.getByStaffAndDateRange(
      session.staffId,
      monthStart,
      monthEnd
    )

    // 統計を計算
    const stats = {
      today: {
        total: todayBookings.length,
        confirmed: todayBookings.filter(b => b.status === "confirmed").length,
        cancelled: todayBookings.filter(b => b.status === "cancelled").length,
        recent: todayBookings.filter(b => b.is_recent).length,
        new: todayBookings.filter(b => !b.is_recent).length,
      },
      week: {
        total: weekBookings.length,
        confirmed: weekBookings.filter(b => b.status === "confirmed").length,
        cancelled: weekBookings.filter(b => b.status === "cancelled").length,
        recent: weekBookings.filter(b => b.is_recent).length,
        new: weekBookings.filter(b => !b.is_recent).length,
      },
      month: {
        total: monthBookings.length,
        confirmed: monthBookings.filter(b => b.status === "confirmed").length,
        cancelled: monthBookings.filter(b => b.status === "cancelled").length,
        recent: monthBookings.filter(b => b.is_recent).length,
        new: monthBookings.filter(b => !b.is_recent).length,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching staff stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
