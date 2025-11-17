import { NextRequest, NextResponse } from "next/server"
import { sendBookingNotificationToAdmin } from "@/lib/email"
import { supabase } from "@/lib/supabase"
import { getConsultationTypeName, getConsultationType } from "@/lib/consultation-types"
import { createCalendarEvent } from "@/lib/google/calendar-simple"
import { isSlotAvailable } from "@/lib/booking/availability"
import crypto from "crypto"

/**
 * POST /api/bookings/simple
 * 予約を作成（Supabaseベース）
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

    const startTime = new Date(body.start_time)
    const endTime = new Date(body.end_time)
    const staffId = body.staff_id

    // consultation_type_idの検証は後で行う（データベースから取得時に確認）

    // スタッフIDを取得（スタッフが指定されていない場合は最初のスタッフを取得）
    let finalStaffId = staffId
    if (!finalStaffId) {
      const { data: staffList } = await supabase
        .from("staff")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single()

      if (!staffList) {
        return NextResponse.json(
          { error: "利用可能なスタッフがいません" },
          { status: 500 }
        )
      }
      finalStaffId = staffList.id
    }

    // ダブルブッキングチェック
    const available = await isSlotAvailable(startTime, endTime, finalStaffId)
    if (!available) {
      return NextResponse.json(
        { error: "この時間枠はすでに予約されています" },
        { status: 409 }
      )
    }

    // キャンセルトークン生成
    const cancelToken = crypto.randomBytes(32).toString("hex")

    // 相談種別IDを取得（consultation_typesテーブルから）
    const { data: consultationTypeData, error: typeError } = await supabase
      .from("consultation_types")
      .select("id, name")
      .eq("id", body.consultation_type_id)
      .single()

    if (typeError || !consultationTypeData) {
      console.error("Failed to find consultation type:", typeError)
      return NextResponse.json(
        { error: "無効な相談種別です", details: typeError?.message },
        { status: 400 }
      )
    }

    console.log(`📋 Consultation type: ${consultationTypeData.name} (ID: ${consultationTypeData.id})`)

    // Supabaseに予約を保存
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        client_name: body.client_name,
        client_email: body.client_email,
        client_company: body.client_company || null,
        client_memo: body.client_memo || null,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: body.duration_minutes || 30,
        staff_id: finalStaffId,
        consultation_type_id: consultationTypeData.id,
        status: "confirmed",
        cancel_token: cancelToken,
        is_recent: false,
      })
      .select()
      .single()

    if (bookingError || !booking) {
      console.error("Failed to create booking:", bookingError)
      return NextResponse.json(
        { error: "予約の作成に失敗しました" },
        { status: 500 }
      )
    }

    console.log(`📝 Booking created: ${booking.id}`)

    // 商材質問の回答を保存
    if (body.questionnaire_answers && Object.keys(body.questionnaire_answers).length > 0) {
      const answerInserts = Object.entries(body.questionnaire_answers).map(([questionId, answer]) => ({
        booking_id: booking.id,
        question_id: questionId,
        answer_text: typeof answer === "string" ? answer : null,
        answer_json: Array.isArray(answer) ? answer : null,
      }))

      const { error: answersError } = await supabase
        .from("product_booking_answers")
        .insert(answerInserts)

      if (answersError) {
        console.error("Failed to save product answers:", answersError)
        // 回答保存失敗でもエラーは返さない（予約は成功）
      } else {
        console.log(`📋 Product answers saved: ${answerInserts.length} answers`)
      }
    }

    // 商材名を自動取得
    const consultationTypeName = getConsultationTypeName(body.consultation_type_id)

    // Google Calendarにイベントを作成
    let calendarEventId = null
    let meetLink = null
    try {
      const calendarId = process.env.GOOGLE_CALENDAR_IDS?.split(",")[0]
      if (calendarId) {
        const calendarEvent = await createCalendarEvent(calendarId.trim(), {
          summary: `${consultationTypeName} - ${body.client_name}様`,
          description: `会社: ${body.client_company || "なし"}\nメール: ${body.client_email}\n\n${body.client_memo || ""}`,
          start: new Date(body.start_time),
          end: new Date(body.end_time),
          attendees: [{ email: body.client_email }],
        })
        calendarEventId = calendarEvent.eventId
        meetLink = calendarEvent.meetLink
        console.log(`📅 Calendar event created: ${calendarEventId}`)
        if (meetLink) {
          console.log(`🎥 Meet link generated: ${meetLink}`)
        }
      }
    } catch (calendarError) {
      console.error("Calendar event creation failed:", calendarError)
      // カレンダー作成失敗でもエラーは返さない
    }

    // 管理者にメール通知
    try {
      await sendBookingNotificationToAdmin({
        bookingId: booking.id, // Pass booking ID for logging
        clientName: body.client_name,
        clientEmail: body.client_email,
        clientCompany: body.client_company,
        consultationType: consultationTypeName,
        startTime: new Date(body.start_time),
        endTime: new Date(body.end_time),
        staffName: body.staff_name || "担当者",
      })
      console.log("📧 Email notification sent to admin")
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // メール送信失敗でもエラーは返さない
    }

    return NextResponse.json({
      booking_id: booking.id,
      cancel_token: cancelToken,
      google_meet_link: meetLink,
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
