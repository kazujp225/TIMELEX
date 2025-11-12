import { NextRequest, NextResponse } from "next/server"
import { bookingDb } from "@/lib/supabase/database"
import { deleteCalendarEvent } from "@/lib/google/calendar"
import { sendCancellationEmail } from "@/lib/email/resend"
import { bookingAudit } from "@/lib/audit-log"

/**
 * POST /api/bookings/:id/cancel
 * 予約をキャンセル
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { cancel_token } = body

    if (!cancel_token) {
      return NextResponse.json(
        { error: "cancel_token is required" },
        { status: 400 }
      )
    }

    // 予約を取得
    const booking = await bookingDb.getByCancelToken(cancel_token)

    if (!booking || booking.id !== id) {
      return NextResponse.json(
        { error: "Booking not found or invalid token" },
        { status: 404 }
      )
    }

    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "Booking already cancelled" },
        { status: 400 }
      )
    }

    // キャンセル期限チェック（デフォルト: 2時間前）
    const now = new Date()
    const startTime = new Date(booking.start_time)
    const deadlineHours = 2 // TODO: 設定から取得
    const deadline = new Date(startTime.getTime() - deadlineHours * 60 * 60 * 1000)

    if (now > deadline) {
      return NextResponse.json(
        {
          error: "キャンセル期限を過ぎています。お手数ですがメールでご連絡ください。",
        },
        { status: 400 }
      )
    }

    // Google Calendarから削除
    try {
      await deleteCalendarEvent(booking.staff_id, booking.google_event_id)
    } catch (error) {
      console.error("Failed to delete Google Calendar event:", error)
      // Google Calendar削除失敗でもキャンセル処理は続行
    }

    // データベースで予約をキャンセル
    await bookingDb.cancel(id)

    // キャンセル通知メール送信
    try {
      await sendCancellationEmail(booking)
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError)
      // メール送信失敗でもエラーは返さない
    }

    // 監査ログを記録
    await bookingAudit.cancelled(
      id,
      cancel_token,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    )

    return NextResponse.json({
      message: "Booking cancelled successfully",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      {
        error: "Failed to cancel booking",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
