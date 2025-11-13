# 🚀 Renderへのデプロイガイド

## 📋 事前準備

### 必要なアカウント
- ✅ GitHub アカウント
- ✅ Render アカウント（https://render.com/）
- ✅ Supabase アカウント（データベース）
- ✅ Resend アカウント（メール送信）
- ✅ Google Cloud Console（Calendar API用）

---

## 🔧 ステップ1: GitHubにプッシュ

```bash
# Git初期化（まだの場合）
git init
git add .
git commit -m "Initial commit for Render deployment"

# GitHubリポジトリを作成して、リモートを追加
git remote add origin https://github.com/YOUR_USERNAME/TIMREXPLUS.git
git branch -M main
git push -u origin main
```

---

## 🌐 ステップ2: Renderでサービスを作成

### 2-1. Render Dashboardにアクセス
1. https://dashboard.render.com/ にログイン
2. 「New +」→「Web Service」をクリック

### 2-2. GitHubリポジトリを接続
1. 「Connect a repository」でGitHubアカウントを接続
2. `TIMREXPLUS` リポジトリを選択
3. 「Connect」をクリック

### 2-3. サービス設定

| 項目 | 設定値 |
|------|--------|
| **Name** | `timrexplus` |
| **Region** | `Singapore (Southeast Asia)` または `Oregon (US West)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Starter` ($7/month) |

---

## 🔐 ステップ3: 環境変数を設定

Render Dashboardの「Environment」タブで以下を設定：

### 必須の環境変数

```bash
# Node環境
NODE_ENV=production
PORT=3000

# NextAuth
NEXTAUTH_URL=https://timrexplus.onrender.com
NEXTAUTH_SECRET=c9bb2ef388020fdc163c311c830eb38b67baf885af1cf41dbb029c6c8ec36522

# Resend (メール送信)
RESEND_API_KEY=re_6Co2X8qg_4DDitqJ243sru92NpbbzxnSb
ADMIN_EMAIL=team@zettai.co.jp
EMAIL_FROM=onboarding@resend.dev
EMAIL_REPLY_TO=contact@zettai.co.jp

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-app.onrender.com/api/auth/callback/google

# 暗号化キー（32バイトのランダムな16進数文字列）
ENCRYPTION_KEY=your_32_byte_hex_encryption_key

# Cronジョブ認証（32バイトのランダムな16進数文字列）
CRON_SECRET=your_32_byte_hex_cron_secret

# 管理者パスワード
NEXT_PUBLIC_ADMIN_PASSWORD=0000

# アプリケーション設定
NEXT_PUBLIC_APP_NAME=TIMREXPLUS
NEXT_PUBLIC_APP_URL=https://timrexplus.onrender.com
```

### ⚠️ 重要な注意事項

1. **NEXTAUTH_URL**: `https://timrexplus.onrender.com` をあなたのRenderドメインに変更
2. **GOOGLE_REDIRECT_URI**: 上記と同じドメインを使用
3. **NEXT_PUBLIC_APP_URL**: 上記と同じドメインを使用

---

## 🔄 ステップ4: デプロイ

1. 「Create Web Service」をクリック
2. Renderが自動的にビルド・デプロイを開始
3. 「Logs」タブでビルドログを確認
4. デプロイ完了後、URLをクリックしてアクセス

---

## ✅ ステップ5: 動作確認

### 5-1. 基本動作確認
```
https://timrexplus.onrender.com/book/1
```
にアクセスして予約フローをテスト

### 5-2. メール送信確認
1. 予約を作成
2. `team@zettai.co.jp` にメールが届くか確認

### 5-3. 管理画面確認
```
https://timrexplus.onrender.com/admin
```
にアクセスして管理機能をテスト

---

## 🔧 トラブルシューティング

### ビルドエラー

**エラー**: `Module not found`
```bash
# 解決策: package.jsonの依存関係を確認
npm install
npm run build
```

### 環境変数エラー

**エラー**: `RESEND_API_KEY is not set`
```
解決策: Render Dashboardの「Environment」タブで環境変数を再確認
```

### メール送信失敗

**エラー**: `API key is invalid`
```
解決策:
1. RESEND_API_KEYが正しいか確認
2. Resend Dashboardでキーの有効性を確認
3. Renderのログで実際に読み込まれているキーを確認
```

---

## 📊 監視・メンテナンス

### ログの確認
Render Dashboard → サービス → 「Logs」タブ

### デプロイ履歴
Render Dashboard → サービス → 「Events」タブ

### 自動デプロイ
- `main`ブランチへのプッシュで自動デプロイ
- プルリクエストプレビューも利用可能

---

## 🚀 本番環境への移行

### Resendドメイン認証
1. https://resend.com/domains にアクセス
2. `zettai.co.jp` を追加
3. DNS設定（SPF/DKIM/DMARC）を追加
4. 認証完了後、`EMAIL_FROM=no-reply@zettai.co.jp` に変更

### カスタムドメインの設定
1. Render Dashboard → サービス → 「Settings」タブ
2. 「Custom Domain」セクション
3. `timrex.zettai.co.jp` などを追加
4. DNSレコードを設定（CNAME）

---

## 📞 サポート

### Render関連
- ドキュメント: https://render.com/docs
- サポート: https://render.com/support

### プロジェクト関連
- 技術担当: Claude (AI Assistant)
- 問い合わせ: team@zettai.co.jp

---

**最終更新**: 2025-11-13
