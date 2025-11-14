/**
 * リマインドメール送信サービス
 * Cron jobから呼び出されて、該当する予約にリマインダーを送信
 */

import { supabaseAdmin } from "@/lib/supabase/client"
import { decrypt } from "@/lib/encryption"
import { Resend } from "resend"
import {
  get24HourReminderEmailHtml,
  get24HourReminderEmailText,
  get30MinuteReminderEmailHtml,
  get30MinuteReminderEmailText,
} from "@/lib/email/reminder-templates"

// Resendクライアントを遅延初期化（ビルド時のエラーを回避）
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "")
}

export type ReminderType = "24h" | "30m"

interface BookingForReminder {
  id: string
  client_name: string
  client_email: string
  start_time: string
  end_time: string
  meet_link: string | null
  cancel_token: string
  reminder_24h_enabled: boolean
  reminder_30m_enabled: boolean
  staff: {
    name: string
    email: string
    timezone: string
  }
  consultation_type: {
    name: string
  }
}

/**
 * リマインダー送信が必要な予約を取得
 *
 * @param reminderType - リマインダー種別（24h または 30m）
 * @returns リマインダー送信対象の予約リスト
 */
export async function getBookingsNeedingReminder(
  reminderType: ReminderType
): Promise<BookingForReminder[]> {
  const now = new Date()

  // リマインダー送信のウィンドウを計算
  let windowStart: Date
  let windowEnd: Date

  if (reminderType === "24h") {
    // 24時間後±5分のウィンドウ
    windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 55 * 60 * 1000) // 23h55m後
    windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 5 * 60 * 1000)   // 24h05m後
  } else {
    // 30分後±2分のウィンドウ
    windowStart = new Date(now.getTime() + 28 * 60 * 1000) // 28分後
    windowEnd = new Date(now.getTime() + 32 * 60 * 1000)   // 32分後
  }

  // まだリマインダーを送信していない予約を取得
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      client_name,
      client_email,
      start_time,
      end_time,
      meet_link,
      cancel_token,
      reminder_24h_enabled,
      reminder_30m_enabled,
      staff:staff_id(name, email, timezone),
      consultation_type:consultation_type_id(name)
    `)
    .eq("status", "confirmed")
    .gte("start_time", windowStart.toISOString())
    .lte("start_time", windowEnd.toISOString())

  if (error) {
    console.error("Failed to fetch bookings for reminder:", error)
    throw error
  }

  if (!data || data.length === 0) {
    return []
  }

  // すでにリマインダーが送信されていない予約だけをフィルタ
  const bookingsWithoutReminder: BookingForReminder[] = []

  for (const booking of data as any[]) {
    // リマインダー設定がオフの場合はスキップ
    if (reminderType === "24h" && !booking.reminder_24h_enabled) continue
    if (reminderType === "30m" && !booking.reminder_30m_enabled) continue

    // すでにこのタイプのリマインダーが送信済みかチェック
    const { data: existingReminder } = await supabaseAdmin
      .from("email_reminders")
      .select("id")
      .eq("booking_id", booking.id)
      .eq("reminder_type", reminderType)
      .single()

    if (!existingReminder) {
      bookingsWithoutReminder.push(booking as BookingForReminder)
    }
  }

  return bookingsWithoutReminder
}

/**
 * リマインダーメールを送信
 *
 * @param booking - 予約情報
 * @param reminderType - リマインダー種別
 * @returns 送信成功かどうか
 */
export async function sendReminderEmail(
  booking: BookingForReminder,
  reminderType: ReminderType
): Promise<{ success: boolean; error?: string }> {
  try {
    // 暗号化されたフィールドを復号化
    const clientName = decrypt(booking.client_name)
    const clientEmail = decrypt(booking.client_email)

    // メールテンプレートデータを準備
    const emailData = {
      clientName,
      staffName: booking.staff.name,
      consultationType: booking.consultation_type.name,
      startTime: new Date(booking.start_time),
      endTime: new Date(booking.end_time),
      meetLink: booking.meet_link || undefined,
      cancelToken: booking.cancel_token,
      timezone: booking.staff.timezone,
    }

    // テンプレートを選択
    const subject =
      reminderType === "24h"
        ? "【明日です】ご予約のリマインダー - TIMREXPLUS"
        : "【まもなく開始】ご予約のリマインダー - TIMREXPLUS"

    const html =
      reminderType === "24h"
        ? get24HourReminderEmailHtml(emailData)
        : get30MinuteReminderEmailHtml(emailData)

    const text =
      reminderType === "24h"
        ? get24HourReminderEmailText(emailData)
        : get30MinuteReminderEmailText(emailData)

    // メール送信
    const resend = getResendClient()
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "TIMREXPLUS <no-reply@timrexplus.com>",
      to: clientEmail,
      subject,
      html,
      text,
    })

    if (result.error) {
      console.error("Failed to send reminder email:", result.error)

      // 失敗を記録
      await supabaseAdmin.from("email_reminders").insert({
        booking_id: booking.id,
        reminder_type: reminderType,
        email_to: clientEmail,
        email_status: "failed",
        error_message: result.error.message,
      })

      return { success: false, error: result.error.message }
    }

    // 成功を記録
    await supabaseAdmin.from("email_reminders").insert({
      booking_id: booking.id,
      reminder_type: reminderType,
      email_to: clientEmail,
      email_status: "sent",
    })

    console.log(`✅ Reminder email sent: ${reminderType} to ${clientEmail} (booking: ${booking.id})`)

    return { success: true }
  } catch (error) {
    console.error("Error sending reminder email:", error)

    // エラーを記録
    try {
      await supabaseAdmin.from("email_reminders").insert({
        booking_id: booking.id,
        reminder_type: reminderType,
        email_to: decrypt(booking.client_email),
        email_status: "failed",
        error_message: error instanceof Error ? error.message : "Unknown error",
      })
    } catch (logError) {
      console.error("Failed to log reminder error:", logError)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * リマインダー送信のメイン処理
 * Cron jobから呼び出される
 *
 * @param reminderType - リマインダー種別
 * @returns 送信結果のサマリー
 */
export async function processReminders(reminderType: ReminderType): Promise<{
  total: number
  sent: number
  failed: number
  errors: string[]
}> {
  console.log(`🔔 Starting reminder processing: ${reminderType}`)

  const result = {
    total: 0,
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // リマインダーが必要な予約を取得
    const bookings = await getBookingsNeedingReminder(reminderType)
    result.total = bookings.length

    console.log(`Found ${bookings.length} bookings needing ${reminderType} reminder`)

    if (bookings.length === 0) {
      return result
    }

    // 各予約にリマインダーを送信
    for (const booking of bookings) {
      const sendResult = await sendReminderEmail(booking, reminderType)

      if (sendResult.success) {
        result.sent++
      } else {
        result.failed++
        result.errors.push(`${booking.id}: ${sendResult.error}`)
      }

      // API制限を避けるため少し待機
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    console.log(
      `✅ Reminder processing complete: ${reminderType} - Sent: ${result.sent}, Failed: ${result.failed}`
    )
  } catch (error) {
    console.error("Error processing reminders:", error)
    result.errors.push(error instanceof Error ? error.message : "Unknown error")
  }

  return result
}
