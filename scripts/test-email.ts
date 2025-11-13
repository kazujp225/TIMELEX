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
      subject: "🧪 TIMREXPLUS - メール送信テスト",
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #6EC5FF 0%, #FFC870 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .content {
      background: #ffffff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
    }
    .success-box {
      background: #d1fae5;
      border-left: 4px solid #10b981;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; font-size: 24px;">✅ メール送信テスト</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">TIMREXPLUS</p>
  </div>

  <div class="content">
    <div class="success-box">
      <strong>🎉 テスト成功！</strong>
      <p style="margin: 10px 0 0 0;">
        Resendからのメール送信が正常に機能しています。
      </p>
    </div>

    <h2 style="color: #6EC5FF;">確認項目</h2>
    <ul>
      <li>✅ Resend APIキーが正しく設定されています</li>
      <li>✅ メール送信機能が正常に動作しています</li>
      <li>✅ HTMLメールのレンダリングが正常です</li>
    </ul>

    <h2 style="color: #6EC5FF;">次のステップ</h2>
    <ol>
      <li>予約システムから実際の予約通知をテスト</li>
      <li>本番環境でドメイン認証を設定（独自ドメインからの送信用）</li>
      <li>メール配信率をモニタリング</li>
    </ol>

    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px;">
      テスト実行日時: ${new Date().toLocaleString("ja-JP")}
    </p>
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
