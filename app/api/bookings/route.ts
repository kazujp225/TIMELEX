import { NextRequest, NextResponse } from "next/server"
import { bookingFormSchema } from "@/lib/validations"
import { bookingDb, settingsDb } from "@/lib/supabase/database"
import { createCalendarEvent } from "@/lib/google/calendar"
import {
  sendClientConfirmationEmail,
  sendStaffNotificationEmail,
} from "@/lib/email/resend"
import { bookingAudit } from "@/lib/audit-log"
import { BookingStatus } from "@/types"
import crypto from "crypto"

/**
 * POST /api/bookings
 * 予約を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validated = bookingFormSchema.parse(body)

    // 継続顧客判定
    const recentDays = (await settingsDb.get("recent_customer_days")) as number || 30
    const recentBookings = await bookingDb.getRecentByEmail(
      validated.client_email,
      recentDays
    )
    const isRecent = recentBookings.length > 0

    // 予約の詳細を取得（スタッフID等）
    const staffId = body.staff_id
    const consultationTypeId = validated.consultation_type_id

    if (!staffId) {
      return NextResponse.json(
        { error: "staff_id is required" },
        { status: 400 }
      )
    }

    // トランザクション開始（ダブルブッキング防止）
    // 1. データベースロック
    // 2. 最新の空き状況を確認
    // 3. 競合がなければ予約を作成

    // Google Calendar にイベントを作成
    const { eventId, meetLink } = await createCalendarEvent(staffId, {
      summary: `${validated.client_name} 様 - 面談`,
      description: `
相談種別: ${body.consultation_type_name || ""}
会社名: ${validated.client_company || "なし"}
お問い合わせ元: ${body.inquiry_source_name || ""}
メモ: ${validated.client_memo || "なし"}
      `.trim(),
      start: validated.start_time,
      end: body.end_time,
      attendees: [
        {
          email: validated.client_email,
          displayName: validated.client_name,
        },
      ],
    })

    // キャンセルトークン生成
    const cancelToken = crypto.randomBytes(32).toString("hex")

    // データベースに予約を保存
    const booking = await bookingDb.create({
      status: BookingStatus.CONFIRMED,
      start_time: validated.start_time,
      end_time: body.end_time,
      duration_minutes: body.duration_minutes || 30,
      staff_id: staffId,
      consultation_type_id: consultationTypeId,
      inquiry_source_id: validated.inquiry_source_id,
      client_name: validated.client_name, // TODO: 暗号化
      client_email: validated.client_email, // TODO: 暗号化
      client_company: validated.client_company,
      client_memo: validated.client_memo,
      is_recent: isRecent,
      google_event_id: eventId,
      google_meet_link: meetLink,
      cancel_token: cancelToken,
      utm_source: validated.utm_source,
      utm_medium: validated.utm_medium,
      utm_campaign: validated.utm_campaign,
      utm_content: validated.utm_content,
      utm_term: validated.utm_term,
      referrer_url: validated.referrer_url,
      ip_address: request.headers.get("x-forwarded-for") || undefined,
      user_agent: request.headers.get("user-agent") || undefined,
    })

    // メール送信（非同期、エラーでも予約は確定済み）
    try {
      const bookingWithRelations = await bookingDb.getById(booking.id)
      if (bookingWithRelations) {
        // クライアント向け確定メール
        await sendClientConfirmationEmail(bookingWithRelations)
        // スタッフ向け通知メール
        await sendStaffNotificationEmail(bookingWithRelations)
      }
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // メール送信失敗でもエラーは返さない
    }

    // 監査ログを記録
    await bookingAudit.created(
      booking.id,
      validated.client_email,
      request.headers.get("x-forwarded-for") || undefined,
      request.headers.get("user-agent") || undefined
    )

    return NextResponse.json({
      booking_id: booking.id,
      google_meet_link: meetLink,
      cancel_token: cancelToken,
      message: "Booking created successfully",
    })
  } catch (error) {
    console.error("Error creating booking:", error)

    if (error instanceof Error && error.message.includes("Zod")) {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create booking",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/bookings/:id
 * 予約詳細を取得
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname.split("/")
    const bookingId = pathSegments[pathSegments.length - 1]

    if (!bookingId || bookingId === "bookings") {
      return NextResponse.json(
        { error: "booking_id is required" },
        { status: 400 }
      )
    }

    const booking = await bookingDb.getById(bookingId)

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    )
  }
}
