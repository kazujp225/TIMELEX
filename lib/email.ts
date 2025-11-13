import { Resend } from "resend"
import { supabase } from "./supabase"

// Resendクライアントを遅延初期化（環境変数の読み込みタイミング問題を回避）
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY
  console.log("🔑 RESEND_API_KEY:", apiKey ? `${apiKey.slice(0, 10)}...` : "NOT SET")
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set")
  }
  return new Resend(apiKey)
}

interface BookingNotificationParams {
  bookingId?: string // Add optional booking ID for logging
  clientName: string
  clientEmail: string
  clientCompany?: string
  consultationType: string
  startTime: Date
  endTime: Date
  staffName: string
}

/**
 * 管理者に新規予約通知を送信
 */
export async function sendBookingNotificationToAdmin(params: BookingNotificationParams) {
  const {
    bookingId,
    clientName,
    clientEmail,
    clientCompany,
    consultationType,
    startTime,
    endTime,
    staffName,
  } = params

  const adminEmail = process.env.ADMIN_EMAIL || "contact@zettai.co.jp"
  const fromEmail = "TIMREXPLUS <onboarding@resend.dev>"

  const formattedDate = startTime.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  const formattedTime = `${startTime.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  })}〜${endTime.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  })}`

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="margin:0; padding:0; background-color:#F3F4F6;">
  <div style="width:100%; padding:24px 0;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto;">
      <tr>
        <td style="padding:0 24px 16px; font-size:12px; color:#9CA3AF; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          TIMREXPLUS
        </td>
      </tr>
      <tr>
        <td style="background-color:#FFFFFF; border-radius:12px; padding:24px; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; border:1px solid #E5E7EB;">

          <!-- タイトル -->
          <h1 style="font-size:18px; margin:0 0 12px; color:#111827;">
            ${clientName}様から予約が届きました
          </h1>

          <!-- 要約 -->
          <p style="font-size:14px; line-height:1.6; margin:0 0 16px; color:#4B5563;">
            以下の内容で予約が確定しています。お客様対応の準備をお願いします。
          </p>

          <!-- 情報ブロック -->
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin:0 0 20px; color:#374151;">
            <tr>
              <td style="padding:8px 0; width:100px; color:#6B7280; vertical-align:top;">お客様</td>
              <td style="padding:8px 0; vertical-align:top;">
                <strong>${clientName}</strong>
                ${clientCompany ? `<div style="color:#6B7280; font-size:13px; margin-top:2px;">${clientCompany}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; vertical-align:top;">メール</td>
              <td style="padding:8px 0; vertical-align:top;">
                <a href="mailto:${clientEmail}" style="color:#2563EB; text-decoration:none;">${clientEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; vertical-align:top;">相談種別</td>
              <td style="padding:8px 0; vertical-align:top;"><strong>${consultationType}</strong></td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; vertical-align:top;">日時</td>
              <td style="padding:8px 0; vertical-align:top;">
                ${formattedDate}<br>
                <strong style="color:#2563EB; font-size:15px;">${formattedTime}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; vertical-align:top;">担当者</td>
              <td style="padding:8px 0; vertical-align:top;"><strong>${staffName}</strong></td>
            </tr>
          </table>

          <!-- 補足 -->
          <p style="font-size:12px; line-height:1.6; margin:16px 0 0; padding:12px; background-color:#FEF3C7; border-left:3px solid #F59E0B; border-radius:4px; color:#92400E;">
            <strong>対応方法</strong><br>
            1. Google Meet URLを作成<br>
            2. <strong>${clientEmail}</strong> 宛にMeet URLを送信
          </p>

        </td>
      </tr>

      <!-- フッター -->
      <tr>
        <td style="padding:16px 24px 0; font-size:11px; color:#9CA3AF; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          © 2025 ZettAI Inc. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `

  const emailSubject = `【${consultationType}】新規予約: ${clientName}様 - ${formattedDate} ${formattedTime}`

  // Create email log entry BEFORE sending
  const { data: emailLog, error: logError } = await supabase
    .from("email_logs")
    .insert({
      email_type: "booking_notification",
      booking_id: bookingId || null,
      to_email: adminEmail,
      to_name: "管理者",
      from_email: fromEmail,
      subject: emailSubject,
      body_html: htmlContent,
      is_sent: false,
      retry_count: 0,
    })
    .select()
    .single()

  if (logError) {
    console.error("Failed to create email log:", logError)
  }

  try {
    const resend = getResendClient()
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [adminEmail],
      subject: emailSubject,
      html: htmlContent,
    })

    if (error) {
      console.error("Failed to send email:", error)

      // Update email log with failure
      if (emailLog) {
        await supabase
          .from("email_logs")
          .update({
            is_sent: false,
            failed_at: new Date().toISOString(),
            resend_error: JSON.stringify(error),
          })
          .eq("id", emailLog.id)
      }

      throw error
    }

    console.log("✅ Email sent successfully:", data?.id)

    // Update email log with success
    if (emailLog) {
      await supabase
        .from("email_logs")
        .update({
          is_sent: true,
          sent_at: new Date().toISOString(),
          resend_id: data?.id,
          resend_status: "sent",
        })
        .eq("id", emailLog.id)
    }

    return data
  } catch (error) {
    console.error("Error sending booking notification:", error)

    // Update email log with failure
    if (emailLog) {
      await supabase
        .from("email_logs")
        .update({
          is_sent: false,
          failed_at: new Date().toISOString(),
          resend_error: error instanceof Error ? error.message : "Unknown error",
        })
        .eq("id", emailLog.id)
    }

    throw error
  }
}
