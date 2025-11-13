# 📧 メール送信機能セットアップガイド

## 🎯 概要

TIMREXPLUS では Resend を使用してメール送信を行います。このドキュメントでは、メール機能のセットアップ方法と運用方法を説明します。

---

## ✅ 現在の実装状況

### 実装済み機能

| 機能 | ファイル | ステータス |
|------|---------|----------|
| 管理者向け予約通知 | `lib/email.ts` | ✅ 完了 |
| クライアント向け予約確認 | `lib/email/resend.ts` | ✅ 完了 |
| スタッフ向け予約通知 | `lib/email/resend.ts` | ✅ 完了 |
| キャンセル通知 | `lib/email/resend.ts` | ✅ 完了 |
| 予約API統合 | `app/api/bookings/route.ts` | ✅ 完了 |

### 環境変数設定

```env
# .env.local
RESEND_API_KEY=re_6Co2X8qg_4DDitqJ243sru92NpbbzxnSb
ADMIN_EMAIL=team@zettai.co.jp
EMAIL_FROM=onboarding@resend.dev
EMAIL_REPLY_TO=contact@zettai.co.jp
```

---

## 🧪 テスト手順

### 1. メール送信テスト（単体）

```bash
# テストスクリプトを実行
npx tsx scripts/test-email.ts
```

**期待される結果**:
```
✅ メール送信成功!
📬 メールID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
📧 管理者メール ( team@zettai.co.jp ) の受信トレイを確認してください。
```

### 2. 予約フローテスト（統合テスト）

1. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

2. **予約ページにアクセス**
   ```
   http://localhost:3000/book
   ```

3. **予約を作成**
   - 空き枠を選択
   - お客様情報を入力
   - 予約を確定

4. **メール受信を確認**
   - 管理者メール (`team@zettai.co.jp`) に予約通知が届く
   - HTML形式で美しくレンダリングされている
   - Google Meetリンクが含まれている（統合後）

---

## ⚠️ 重要な制限事項

### Resendテストモード（現在）

#### 送信可能な宛先
- ✅ **team@zettai.co.jp** のみ

#### 送信不可の宛先
- ❌ contact@zettai.co.jp
- ❌ その他の任意のメールアドレス

#### エラーメッセージ例
```
You can only send testing emails to your own email address (team@zettai.co.jp).
To send emails to other recipients, please verify a domain at resend.com/domains
```

---

## 🚀 本番環境へのアップグレード

### ステップ1: ドメイン認証

1. **Resend Dashboardにアクセス**
   - URL: https://resend.com/domains
   - ログイン: `team@zettai.co.jp` アカウント

2. **ドメインを追加**
   - 「Add Domain」をクリック
   - ドメイン名を入力: `zettai.co.jp`

3. **DNS設定を追加**
   Resendが提示する以下のレコードをDNSに追加：

   ```
   # SPF（送信元認証）
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all

   # DKIM（改ざん検知）
   Type: TXT
   Name: resend._domainkey
   Value: [Resendが提供する値]

   # DMARC（なりすまし対策）
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:postmaster@zettai.co.jp
   ```

4. **認証を確認**
   - DNS設定反映まで最大48時間（通常は数時間）
   - Resend Dashboardで「Verify」をクリック
   - ステータスが「Verified」になればOK

### ステップ2: 環境変数を更新

```env
# .env.local（または本番環境の環境変数）
EMAIL_FROM=no-reply@zettai.co.jp
EMAIL_REPLY_TO=support@zettai.co.jp
ADMIN_EMAIL=contact@zettai.co.jp  # 任意のアドレスに変更可能
```

### ステップ3: 動作確認

1. 再度予約フローをテスト
2. 任意のメールアドレスに送信できることを確認
3. メールの到達率をモニタリング

---

## 📊 メール送信仕様

### 1. 管理者向け予約通知

**トリガー**: 予約作成時

**送信先**: `process.env.ADMIN_EMAIL`

**件名**:
```
🔔 新しい予約: 山田太郎様 - 2025年11月15日（金） 14:00〜15:00
```

**内容**:
- お客様情報（氏名、メール、会社名）
- 予約日時、相談種別、担当者
- Google Meet対応手順書
- 返信用メールテンプレート

**実装**: `lib/email.ts:18` - `sendBookingNotificationToAdmin()`

---

### 2. クライアント向け予約確認メール

**トリガー**: 予約作成時（今後実装）

**送信先**: クライアントのメールアドレス

**件名**:
```
【確定】初回コンサルティング 2025/11/15（金） 14:00
```

**内容**:
- 予約確定通知
- 予約詳細（日時、担当者、相談種別）
- Google Meetリンク
- 予約変更・キャンセルリンク

**実装**: `lib/email/resend.ts:17` - `sendClientConfirmationEmail()`

---

### 3. スタッフ向け予約通知

**トリガー**: 予約作成時（今後実装）

**送信先**: 担当スタッフのメールアドレス

**件名**:
```
[継続][公式HP][初回コンサル] 山田太郎 様 2025/11/15 14:00
```

**内容**:
- 継続/新規バッジ
- クライアント詳細情報
- 流入経路（UTMパラメータ）
- Google Meetリンク

**実装**: `lib/email/resend.ts:199` - `sendStaffNotificationEmail()`

---

### 4. キャンセル通知メール

**トリガー**: 予約キャンセル時

**送信先**: クライアントのメールアドレス

**件名**:
```
【キャンセル完了】初回コンサルティング 2025/11/15（金）
```

**内容**:
- キャンセル完了通知
- キャンセルされた予約詳細

**実装**: `lib/email/resend.ts:380` - `sendCancellationEmail()`

---

## 🔧 トラブルシューティング

### エラー: API key is invalid

**原因**: APIキーが正しく設定されていない

**解決策**:
```bash
# .env.local を確認
cat .env.local | grep RESEND_API_KEY

# 正しい値:
RESEND_API_KEY=re_6Co2X8qg_4DDitqJ243sru92NpbbzxnSb
```

---

### エラー: You can only send testing emails to your own email address

**原因**: ドメイン認証が完了していない

**解決策**:
1. テスト環境: `ADMIN_EMAIL=team@zettai.co.jp` に変更
2. 本番環境: ドメイン認証を完了させる（上記手順参照）

---

### メールが届かない

**確認事項**:
1. **スパムフォルダを確認**
   - Gmailの場合: 「迷惑メール」フォルダ
   - Outlookの場合: 「ジャンク」フォルダ

2. **Resend Dashboardでログを確認**
   - URL: https://resend.com/logs
   - メール送信履歴、エラーログを確認

3. **DNSレコードを確認**（本番環境のみ）
   ```bash
   # SPFレコード確認
   dig TXT zettai.co.jp +short | grep spf

   # DKIMレコード確認
   dig TXT resend._domainkey.zettai.co.jp +short
   ```

---

## 📈 モニタリング

### Resend Dashboard
- URL: https://resend.com/overview
- メール送信数、配信率、バウンス率を確認

### 重要な指標
| 指標 | 目標値 | アラート基準 |
|------|--------|------------|
| **配信率** | 98%以上 | 95%未満 |
| **バウンス率** | 2%未満 | 5%以上 |
| **スパム判定率** | 0.1%未満 | 1%以上 |

---

## 🔒 セキュリティ

### APIキーの管理
- ✅ `.env.local` に保存（Gitにコミットしない）
- ✅ 本番環境はVercelの環境変数で管理
- ❌ コードに直接書かない
- ❌ GitHubなど公開リポジトリにプッシュしない

### 個人情報保護
- クライアントのメールアドレスは暗号化して保存（予定）
- メール本文にクレジットカード情報などの機密情報を含めない

---

## 📝 今後の拡張

### 実装予定の機能
- [ ] リマインダーメール（24時間前、1時間前）
- [ ] 予約変更通知メール
- [ ] アンケートフォームメール（面談後）
- [ ] スタッフ向けデイリーサマリーメール
- [ ] メール配信率の自動モニタリング

### メールテンプレートの改善
- [ ] ダークモード対応
- [ ] モバイル最適化
- [ ] A/Bテスト機能
- [ ] 多言語対応（日本語/英語）

---

## 📞 サポート

### Resendサポート
- ドキュメント: https://resend.com/docs
- サポート: support@resend.com

### プロジェクト内部
- 技術担当: Claude (AI Assistant)
- 問い合わせ: team@zettai.co.jp

---

**最終更新**: 2025-11-13
**次回レビュー**: ドメイン認証完了後
