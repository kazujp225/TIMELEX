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
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 540px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6EC5FF 0%, #FFC870 100%); color: white; padding: 20px; text-align: center; }
    .content { padding: 24px; }
    .row { display: flex; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
    .row:last-child { border-bottom: none; }
    .label { min-width: 80px; font-weight: 600; color: #6b7280; font-size: 13px; }
    .value { flex: 1; color: #1f2937; font-size: 15px; }
    .highlight { background: #fef3c7; border-left: 3px solid #fbbf24; padding: 12px; margin: 16px 0; border-radius: 4px; }
    .footer { text-align: center; padding: 16px; color: #9ca3af; font-size: 12px; background: #f9fafb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px; font-weight: 600;">🔔 新規予約通知</h1>
      <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 14px;">TIMREXPLUS</p>
    </div>

    <div class="content">
      <div class="row">
        <div class="label">お客様</div>
        <div class="value">
          <strong>${clientName}</strong>
          ${clientCompany ? `<div style="color: #6b7280; font-size: 13px; margin-top: 2px;">${clientCompany}</div>` : ""}
        </div>
      </div>

      <div class="row">
        <div class="label">メール</div>
        <div class="value"><a href="mailto:${clientEmail}" style="color: #6EC5FF; text-decoration: none;">${clientEmail}</a></div>
      </div>

      <div class="row">
        <div class="label">商材</div>
        <div class="value"><strong style="color: #F59E0B;">${consultationType}</strong></div>
      </div>

      <div class="row">
        <div class="label">日時</div>
        <div class="value">
          ${formattedDate}<br>
          <strong style="color: #6EC5FF; font-size: 16px;">${formattedTime}</strong>
        </div>
      </div>

      <div class="row">
        <div class="label">担当者</div>
        <div class="value">${staffName}</div>
      </div>

      <div class="highlight">
        <strong style="color: #92400e;">📝 対応方法</strong>
        <ol style="margin: 8px 0 0 16px; padding: 0; font-size: 14px; color: #6b7280;">
          <li style="margin: 4px 0;">Meet URLを作成</li>
          <li style="margin: 4px 0;"><strong>${clientEmail}</strong> に返信</li>
        </ol>
      </div>
    </div>

    <div class="footer">
      TIMREXPLUS 自動送信
    </div>
  </div>
</body>
</html>
  `

  const emailSubject = `🔔 【${consultationType}】新規予約: ${clientName}様 - ${formattedDate} ${formattedTime}`

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
