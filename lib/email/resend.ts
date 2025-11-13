import { Resend } from "resend"
import type { BookingWithRelations } from "@/types"
import { formatDate, getWeekday } from "@/lib/utils"

// Resendクライアントを遅延初期化（ビルド時のエラーを回避）
function getResendClient() {
  return new Resend(process.env.RESEND_API_KEY || "")
}

const FROM_EMAIL = process.env.EMAIL_FROM || "no-reply@yourdomain.com"
const REPLY_TO_EMAIL = process.env.EMAIL_REPLY_TO || "support@yourdomain.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

/**
 * クライアント向け予約確定メール
 */
export async function sendClientConfirmationEmail(
  booking: BookingWithRelations
) {
  const cancelUrl = `${APP_URL}/book/cancel?id=${booking.id}&token=${booking.cancel_token}`

  const subject = `【確定】${booking.consultation_type.name} ${formatDate(
    booking.start_time,
    "YYYY/MM/DD"
  )}（${getWeekday(booking.start_time)}） ${formatDate(
    booking.start_time,
    "HH:mm"
  )}`

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #2D2D2D;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #6EC5FF;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #6EC5FF;
      font-size: 24px;
      margin: 0;
    }
    .content {
      background: #F9FAFB;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .detail-row {
      margin: 12px 0;
    }
    .label {
      color: #666666;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .value {
      font-size: 16px;
      font-weight: 500;
    }
    .datetime {
      font-size: 20px;
      font-weight: bold;
      color: #2D2D2D;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #6EC5FF;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 10px 0;
    }
    .button-secondary {
      background: #FFFFFF;
      color: #6EC5FF;
      border: 2px solid #6EC5FF;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 14px;
      color: #666666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>TIMREXPLUS</h1>
    <p style="margin: 10px 0 0 0; color: #666666;">予約が確定しました</p>
  </div>

  <p>${booking.client_name} 様</p>

  <p>この度は、オンライン面談のご予約をいただきありがとうございます。<br>
  以下の内容で予約が確定いたしました。</p>

  <div class="content">
    <div class="detail-row">
      <div class="label">日時</div>
      <div class="datetime">
        ${formatDate(booking.start_time, "YYYY/MM/DD")}（${getWeekday(
    booking.start_time
  )}）<br>
        ${formatDate(booking.start_time, "HH:mm")}〜${formatDate(
    booking.end_time,
    "HH:mm"
  )}
      </div>
    </div>

    <div class="detail-row">
      <div class="label">お問い合わせ元</div>
      <div class="value">${booking.inquiry_source.name}</div>
    </div>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${booking.google_meet_link}" class="button">
      Google Meetに参加
    </a>
  </div>

  <p style="font-size: 14px; color: #666666;">
    ※ 当日は上記のリンクからご参加ください。<br>
    ※ 開始時刻の5分前からご参加いただけます。
  </p>

  <div style="margin-top: 40px; text-align: center;">
    <p style="font-size: 14px; color: #666666;">予約の変更・キャンセルはこちら</p>
    <a href="${cancelUrl}" class="button button-secondary">
      予約を変更・キャンセル
    </a>
    <p style="font-size: 12px; color: #999999; margin-top: 10px;">
      ※ 開始時刻の2時間前までキャンセル可能です
    </p>
  </div>

  <div class="footer">
    <p>
      ご不明な点がございましたら、<br>
      ${REPLY_TO_EMAIL} までお問い合わせください。
    </p>
    <p style="margin-top: 20px; font-size: 12px;">
      このメールは自動送信されています。<br>
      返信いただいても対応できませんのでご了承ください。
    </p>
  </div>
</body>
</html>
  `

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.client_email,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
    console.log(`Confirmation email sent to ${booking.client_email}`)
  } catch (error) {
    console.error("Failed to send client confirmation email:", error)
    throw error
  }
}

/**
 * スタッフ向け予約通知メール
 */
export async function sendStaffNotificationEmail(
  booking: BookingWithRelations
) {
  const recentTag = booking.is_recent ? "[継続]" : "[新規]"

  const subject = `${recentTag}[${booking.inquiry_source.name}][${
    booking.consultation_type.name
  }] ${booking.client_name} 様 ${formatDate(
    booking.start_time,
    "YYYY/MM/DD HH:mm"
  )}`

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #2D2D2D;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #6EC5FF;
      color: #FFFFFF;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      padding: 4px 8px;
      background: ${booking.is_recent ? "#FFC870" : "#4CAF50"};
      color: #FFFFFF;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      margin-right: 8px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .info-table th {
      text-align: left;
      padding: 12px;
      background: #F9FAFB;
      border-bottom: 2px solid #E5E7EB;
      font-weight: 500;
      color: #666666;
      width: 30%;
    }
    .info-table td {
      padding: 12px;
      border-bottom: 1px solid #E5E7EB;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: #6EC5FF;
      color: #FFFFFF;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">新しい予約が入りました</h2>
  </div>

  <p>
    <span class="badge">${booking.is_recent ? "継続" : "新規"}</span>
    ${booking.client_name} 様から予約が入りました。
  </p>

  <table class="info-table">
    <tr>
      <th>日時</th>
      <td>
        <strong>${formatDate(booking.start_time, "YYYY/MM/DD")}（${getWeekday(
    booking.start_time
  )}）</strong><br>
        ${formatDate(booking.start_time, "HH:mm")}〜${formatDate(
    booking.end_time,
    "HH:mm"
  )}
      </td>
    </tr>
    <tr>
      <th>相談種別</th>
      <td>${booking.consultation_type.name}</td>
    </tr>
    <tr>
      <th>お問い合わせ元</th>
      <td>${booking.inquiry_source.name}</td>
    </tr>
    <tr>
      <th>お名前</th>
      <td>${booking.client_name}</td>
    </tr>
    <tr>
      <th>メールアドレス</th>
      <td>${booking.client_email}</td>
    </tr>
    ${
      booking.client_company
        ? `
    <tr>
      <th>会社名</th>
      <td>${booking.client_company}</td>
    </tr>
    `
        : ""
    }
    ${
      booking.client_memo
        ? `
    <tr>
      <th>メモ</th>
      <td>${booking.client_memo}</td>
    </tr>
    `
        : ""
    }
    ${
      booking.utm_source || booking.utm_campaign
        ? `
    <tr>
      <th>流入経路</th>
      <td>
        ${booking.utm_source ? `Source: ${booking.utm_source}<br>` : ""}
        ${booking.utm_medium ? `Medium: ${booking.utm_medium}<br>` : ""}
        ${booking.utm_campaign ? `Campaign: ${booking.utm_campaign}` : ""}
      </td>
    </tr>
    `
        : ""
    }
  </table>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${booking.google_meet_link}" class="button">
      Google Meetリンク
    </a>
  </div>

  <p style="font-size: 14px; color: #666666; text-align: center;">
    Googleカレンダーにも自動で追加されています
  </p>
</body>
</html>
  `

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.staff.email,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
    console.log(`Notification email sent to ${booking.staff.email}`)
  } catch (error) {
    console.error("Failed to send staff notification email:", error)
    throw error
  }
}

/**
 * キャンセル通知メール（クライアント向け）
 */
export async function sendCancellationEmail(booking: BookingWithRelations) {
  const subject = `【キャンセル完了】${booking.consultation_type.name} ${formatDate(
    booking.start_time,
    "YYYY/MM/DD"
  )}（${getWeekday(booking.start_time)}）`

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #2D2D2D;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 2px solid #FF7676;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #FF7676;">予約がキャンセルされました</h1>
  </div>

  <p>${booking.client_name} 様</p>

  <p>以下の予約がキャンセルされました。</p>

  <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p><strong>${formatDate(booking.start_time, "YYYY/MM/DD")}（${getWeekday(
    booking.start_time
  )}） ${formatDate(booking.start_time, "HH:mm")}〜${formatDate(
    booking.end_time,
    "HH:mm"
  )}</strong></p>
    <p>${booking.consultation_type.name}</p>
  </div>

  <p>またの機会にお待ちしております。</p>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 14px; color: #666666; text-align: center;">
    <p>ご不明な点がございましたら、${REPLY_TO_EMAIL} までお問い合わせください。</p>
  </div>
</body>
</html>
  `

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: FROM_EMAIL,
      to: booking.client_email,
      subject,
      html,
      replyTo: REPLY_TO_EMAIL,
    })
    console.log(`Cancellation email sent to ${booking.client_email}`)
  } catch (error) {
    console.error("Failed to send cancellation email:", error)
    throw error
  }
}
