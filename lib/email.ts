import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface BookingNotificationParams {
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
    clientName,
    clientEmail,
    clientCompany,
    consultationType,
    startTime,
    endTime,
    staffName,
  } = params

  const adminEmail = process.env.ADMIN_EMAIL || "contact@zettai.co.jp"

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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6EC5FF 0%, #FFC870 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .info-box { background: #f9fafb; border-left: 4px solid #6EC5FF; padding: 15px; margin: 15px 0; }
    .info-label { font-weight: 600; color: #6EC5FF; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 16px; color: #1f2937; }
    .action-section { background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .action-title { font-weight: 700; color: #92400e; margin-bottom: 10px; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🔔 新しい予約が入りました</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">TIMREXPLUS</p>
    </div>

    <div class="content">
      <p style="font-size: 16px; margin-bottom: 20px;">
        新しい予約が入りました。お客様に返信して、ミーティングURLを送信してください。
      </p>

      <div class="info-box">
        <div class="info-label">お客様情報</div>
        <div class="info-value"><strong>${clientName}</strong></div>
        ${clientCompany ? `<div class="info-value" style="color: #6b7280; font-size: 14px;">${clientCompany}</div>` : ""}
        <div class="info-value" style="color: #6b7280; font-size: 14px; margin-top: 5px;">${clientEmail}</div>
      </div>

      <div class="info-box">
        <div class="info-label">予約日時</div>
        <div class="info-value">${formattedDate}</div>
        <div class="info-value" style="font-size: 18px; font-weight: 600; color: #6EC5FF; margin-top: 5px;">${formattedTime}</div>
      </div>

      <div class="info-box">
        <div class="info-label">相談種別</div>
        <div class="info-value">${consultationType}</div>
      </div>

      <div class="info-box">
        <div class="info-label">担当者</div>
        <div class="info-value">${staffName}</div>
      </div>

      <div class="action-section">
        <div class="action-title">📝 次のステップ</div>
        <ol style="margin: 10px 0 0 20px; padding: 0;">
          <li style="margin-bottom: 8px;">Google Meet / Zoom / Teams でミーティングURLを作成</li>
          <li style="margin-bottom: 8px;">以下のテンプレートを使って、お客様（<strong>${clientEmail}</strong>）に返信</li>
          <li>件名: 【TIMREXPLUS】ご予約ありがとうございます</li>
        </ol>
      </div>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 20px;">
        <p style="font-weight: 600; margin-bottom: 10px;">💡 メールテンプレート例</p>
        <div style="background: white; padding: 15px; border-radius: 4px; font-size: 14px; line-height: 1.8;">
          <p>${clientName} 様</p>
          <p>お問い合わせありがとうございます。<br>
          ${formattedDate} ${formattedTime} のご予約を承りました。</p>
          <p>当日は以下のURLからご参加ください：<br>
          <strong>【ここにミーティングURLを貼り付け】</strong></p>
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <p>株式会社ZettAI<br>
          TIMREXPLUS運営チーム</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>このメールは TIMREXPLUS から自動送信されています</p>
    </div>
  </div>
</body>
</html>
  `

  try {
    const { data, error } = await resend.emails.send({
      from: "TIMREXPLUS <onboarding@resend.dev>", // 本番環境では独自ドメインに変更
      to: [adminEmail],
      subject: `🔔 新しい予約: ${clientName}様 - ${formattedDate} ${formattedTime}`,
      html: htmlContent,
    })

    if (error) {
      console.error("Failed to send email:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error sending booking notification:", error)
    throw error
  }
}
