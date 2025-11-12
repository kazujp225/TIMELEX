/**
 * リマインドメールテンプレート
 * 24時間前・30分前の予約リマインダー
 */

import { formatInTimeZone } from "date-fns-tz"
import { ja } from "date-fns/locale"

interface ReminderEmailData {
  clientName: string
  staffName: string
  consultationType: string
  startTime: Date
  endTime: Date
  meetLink?: string
  cancelToken: string
  timezone: string
}

/**
 * 24時間前リマインドメールHTML
 */
export function get24HourReminderEmailHtml(data: ReminderEmailData): string {
  const dateStr = formatInTimeZone(data.startTime, data.timezone, "yyyy年M月d日(E)", {
    locale: ja,
  })
  const timeStr = formatInTimeZone(data.startTime, data.timezone, "HH:mm", {
    locale: ja,
  })
  const endTimeStr = formatInTimeZone(data.endTime, data.timezone, "HH:mm", {
    locale: ja,
  })

  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?token=${data.cancelToken}`

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【明日です】予約リマインダー</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6EC5FF 0%, #5AB3E8 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                ⏰ 明日、ご予約があります
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${data.clientName} 様
              </p>

              <p style="margin: 0 0 24px 0; color: #666666; font-size: 15px; line-height: 1.7;">
                明日の予約が近づいてまいりました。<br>
                以下の内容でお待ちしております。
              </p>

              <!-- Booking Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">📅 日時</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; color: #333333; font-size: 18px; font-weight: 600;">
                          ${dateStr} ${timeStr}〜${endTimeStr}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">👤 担当スタッフ</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; color: #333333; font-size: 16px;">
                          ${data.staffName}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">📋 相談種別</td>
                      </tr>
                      <tr>
                        <td style="padding: 0; color: #333333; font-size: 16px;">
                          ${data.consultationType}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${
                data.meetLink
                  ? `
              <!-- Meet Link Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.meetLink}" style="display: inline-block; background-color: #6EC5FF; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      📹 Google Meetに参加
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #999999; font-size: 13px; text-align: center;">
                ミーティングリンク: <a href="${data.meetLink}" style="color: #6EC5FF; text-decoration: none;">${data.meetLink}</a>
              </p>
              `
                  : ""
              }

              <!-- Reminder Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FFF8E1; border-left: 4px solid #FFC870; border-radius: 4px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      💡 <strong>30分前にもリマインドをお送りします</strong><br>
                      予約時刻の30分前に、最終リマインドメールをお送りいたします。
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Cancel Link -->
              <p style="margin: 0 0 8px 0; color: #666666; font-size: 14px; text-align: center;">
                ご都合が悪くなった場合は、以下よりキャンセルが可能です
              </p>
              <p style="margin: 0; color: #999999; font-size: 13px; text-align: center;">
                <a href="${cancelUrl}" style="color: #FF7676; text-decoration: underline;">予約をキャンセルする</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">
                TIMREXPLUS - オンライン予約システム
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px;">
                このメールは自動送信されています
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * 30分前リマインドメールHTML
 */
export function get30MinuteReminderEmailHtml(data: ReminderEmailData): string {
  const dateStr = formatInTimeZone(data.startTime, data.timezone, "yyyy年M月d日(E)", {
    locale: ja,
  })
  const timeStr = formatInTimeZone(data.startTime, data.timezone, "HH:mm", {
    locale: ja,
  })
  const endTimeStr = formatInTimeZone(data.endTime, data.timezone, "HH:mm", {
    locale: ja,
  })

  return `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【まもなくです】予約リマインダー</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FFC870 0%, #FFB84D 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🔔 30分後に予約があります
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 24px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${data.clientName} 様
              </p>

              <p style="margin: 0 0 24px 0; color: #666666; font-size: 15px; line-height: 1.7;">
                まもなく予約時刻となります。<br>
                ご準備をお願いいたします。
              </p>

              <!-- Booking Details Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">📅 日時</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; color: #333333; font-size: 18px; font-weight: 600;">
                          ${dateStr} ${timeStr}〜${endTimeStr}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">👤 担当スタッフ</td>
                      </tr>
                      <tr>
                        <td style="padding: 0 0 16px 0; color: #333333; font-size: 16px;">
                          ${data.staffName}
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 13px; font-weight: 600;">📋 相談種別</td>
                      </tr>
                      <tr>
                        <td style="padding: 0; color: #333333; font-size: 16px;">
                          ${data.consultationType}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${
                data.meetLink
                  ? `
              <!-- Meet Link Button - Prominent -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${data.meetLink}" style="display: inline-block; background-color: #FFC870; color: #333333; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 18px; font-weight: 700; box-shadow: 0 4px 12px rgba(255, 200, 112, 0.3);">
                      📹 今すぐGoogle Meetに参加
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px 0; color: #999999; font-size: 13px; text-align: center;">
                ミーティングリンク: <a href="${data.meetLink}" style="color: #FFC870; text-decoration: none;">${data.meetLink}</a>
              </p>
              `
                  : ""
              }

              <!-- Preparation Notice -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E3F2FD; border-left: 4px solid #6EC5FF; border-radius: 4px; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      💡 <strong>ご準備のお願い</strong><br>
                      • カメラ・マイクの動作確認<br>
                      • 静かな環境の確保<br>
                      • 必要な資料のご準備
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 24px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; color: #999999; font-size: 13px;">
                TIMREXPLUS - オンライン予約システム
              </p>
              <p style="margin: 0; color: #cccccc; font-size: 12px;">
                このメールは自動送信されています
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * 24時間前リマインドメールテキスト版
 */
export function get24HourReminderEmailText(data: ReminderEmailData): string {
  const dateStr = formatInTimeZone(data.startTime, data.timezone, "yyyy年M月d日(E)", {
    locale: ja,
  })
  const timeStr = formatInTimeZone(data.startTime, data.timezone, "HH:mm", {
    locale: ja,
  })
  const endTimeStr = formatInTimeZone(data.endTime, data.timezone, "HH:mm", {
    locale: ja,
  })

  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/book/cancel?token=${data.cancelToken}`

  return `
【明日です】予約リマインダー

${data.clientName} 様

明日の予約が近づいてまいりました。
以下の内容でお待ちしております。

━━━━━━━━━━━━━━━━━━━━
📅 日時
${dateStr} ${timeStr}〜${endTimeStr}

👤 担当スタッフ
${data.staffName}

📋 相談種別
${data.consultationType}

${data.meetLink ? `📹 Google Meetリンク\n${data.meetLink}\n` : ""}━━━━━━━━━━━━━━━━━━━━

💡 30分前にもリマインドをお送りします
予約時刻の30分前に、最終リマインドメールをお送りいたします。

ご都合が悪くなった場合は、以下よりキャンセルが可能です
${cancelUrl}

────────────────────────
TIMREXPLUS - オンライン予約システム
このメールは自動送信されています
  `.trim()
}

/**
 * 30分前リマインドメールテキスト版
 */
export function get30MinuteReminderEmailText(data: ReminderEmailData): string {
  const dateStr = formatInTimeZone(data.startTime, data.timezone, "yyyy年M月d日(E)", {
    locale: ja,
  })
  const timeStr = formatInTimeZone(data.startTime, data.timezone, "HH:mm", {
    locale: ja,
  })
  const endTimeStr = formatInTimeZone(data.endTime, data.timezone, "HH:mm", {
    locale: ja,
  })

  return `
【まもなくです】予約リマインダー

${data.clientName} 様

まもなく予約時刻となります。
ご準備をお願いいたします。

━━━━━━━━━━━━━━━━━━━━
📅 日時
${dateStr} ${timeStr}〜${endTimeStr}

👤 担当スタッフ
${data.staffName}

📋 相談種別
${data.consultationType}

${data.meetLink ? `📹 Google Meetリンク\n${data.meetLink}\n` : ""}━━━━━━━━━━━━━━━━━━━━

💡 ご準備のお願い
• カメラ・マイクの動作確認
• 静かな環境の確保
• 必要な資料のご準備

────────────────────────
TIMREXPLUS - オンライン予約システム
このメールは自動送信されています
  `.trim()
}
