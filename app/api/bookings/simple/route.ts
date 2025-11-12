import { NextRequest, NextResponse } from "next/server"
import { sendBookingNotificationToAdmin } from "@/lib/email"
import { createBooking } from "@/lib/mock-db"
import crypto from "crypto"

/**
 * POST /api/bookings/simple
 * 予約を作成（Supabaseなしの簡易版）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 必須フィールドのチェック
    if (!body.client_name || !body.client_email || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { error: "必須フィールドが不足しています" },
        { status: 400 }
      )
    }

    // キャンセルトークン生成
    const cancelToken = crypto.randomBytes(32).toString("hex")

    // インメモリDBに予約を保存
    const booking = createBooking({
      client_name: body.client_name,
      client_email: body.client_email,
      client_company: body.client_company || "",
      client_memo: body.client_memo || "",
      start_time: body.start_time,
      end_time: body.end_time,
      duration_minutes: body.duration_minutes || 30,
      staff_id: body.staff_id,
      staff_name: body.staff_name || "担当者",
      consultation_type_id: body.consultation_type_id,
      consultation_type_name: body.consultation_type_name || "",
      status: "confirmed",
      cancel_token: cancelToken,
    })

    // 管理者にメール通知
    try {
      await sendBookingNotificationToAdmin({
        clientName: body.client_name,
        clientEmail: body.client_email,
        clientCompany: body.client_company,
        consultationType: body.consultation_type_name || "",
        startTime: new Date(body.start_time),
        endTime: new Date(body.end_time),
        staffName: body.staff_name || "担当者",
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // メール送信失敗でもエラーは返さない
    }

    return NextResponse.json({
      booking_id: booking.id,
      cancel_token: cancelToken,
      message: "予約が完了しました",
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json(
      {
        error: "予約の作成に失敗しました",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
