/**
 * Resendメール送信テストスクリプト
 *
 * 実行方法:
 * npx tsx scripts/test-email.ts
 */

import { Resend } from "resend"
import * as dotenv from "dotenv"
import * as path from "path"

// 環境変数を読み込み
const result = dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })

if (result.error) {
  console.error("❌ .env.local の読み込みに失敗しました:", result.error)
  process.exit(1)
}

console.log("✅ .env.local を読み込みました")
console.log(`📂 作業ディレクトリ: ${process.cwd()}`)

const resend = new Resend(process.env.RESEND_API_KEY)

async function testEmail() {
  console.log("🧪 Resendメール送信テスト開始...")
  console.log(`📧 送信先: ${process.env.ADMIN_EMAIL}`)
  console.log(`🔑 APIキー: ${process.env.RESEND_API_KEY?.slice(0, 10)}...`)
  console.log()

  try {
    const { data, error } = await resend.emails.send({
      from: "TIMREXPLUS <onboarding@resend.dev>",
      to: ["team@zettai.co.jp"], // Resendテストモードでは自分のメールアドレスのみ
      subject: "TIMREXPLUS - メール送信テスト",
      html: `
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
            メール送信テスト
          </h1>

          <!-- 要約 -->
          <p style="font-size:14px; line-height:1.6; margin:0 0 16px; color:#4B5563;">
            Resendからのメール送信が正常に機能しています。
          </p>

          <!-- 成功メッセージ -->
          <div style="font-size:12px; line-height:1.6; margin:16px 0; padding:12px; background-color:#D1FAE5; border-left:3px solid #10B981; border-radius:4px; color:#065F46;">
            <strong>テスト成功</strong><br>
            メール配信システムが正常に動作しています。
          </div>

          <!-- 確認項目 -->
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; margin:16px 0; color:#374151;">
            <tr>
              <td style="padding:8px 0; vertical-align:top;">•</td>
              <td style="padding:8px 0 8px 8px; vertical-align:top;">Resend APIキーが正しく設定されています</td>
            </tr>
            <tr>
              <td style="padding:8px 0; vertical-align:top;">•</td>
              <td style="padding:8px 0 8px 8px; vertical-align:top;">メール送信機能が正常に動作しています</td>
            </tr>
            <tr>
              <td style="padding:8px 0; vertical-align:top;">•</td>
              <td style="padding:8px 0 8px 8px; vertical-align:top;">HTMLメールのレンダリングが正常です</td>
            </tr>
          </table>

          <!-- 補足 -->
          <p style="font-size:11px; line-height:1.6; margin:20px 0 0; padding-top:20px; border-top:1px solid #E5E7EB; color:#9CA3AF;">
            テスト実行日時: ${new Date().toLocaleString("ja-JP")}
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
      `,
    })

    if (error) {
      console.error("❌ メール送信エラー:", error)
      process.exit(1)
    }

    console.log("✅ メール送信成功!")
    console.log("📬 メールID:", data?.id)
    console.log()
    console.log("📧 管理者メール (", process.env.ADMIN_EMAIL, ") の受信トレイを確認してください。")
    console.log()
  } catch (error) {
    console.error("❌ 予期しないエラー:", error)
    process.exit(1)
  }
}

testEmail()
