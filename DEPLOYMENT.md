# TIMREXPLUS - デプロイガイド

## 📋 目次
1. [前提条件](#前提条件)
2. [環境変数の設定](#環境変数の設定)
3. [ローカルでの動作確認](#ローカルでの動作確認)
4. [Renderへのデプロイ](#renderへのデプロイ)
5. [デプロイ後の確認](#デプロイ後の確認)
6. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必要なアカウント

1. **Supabase**
   - プロジェクト作成済み
   - テーブル作成済み（staff, consultation_types, bookings等）
   - RLSが無効化されている（Unprotected）

2. **Resend**
   - アカウント作成済み
   - APIキー取得済み
   - テストモード（team@zettai.co.jp のみ送信可能）

3. **Google Cloud Platform**（オプション - Google Meetを使う場合）
   - プロジェクト作成
   - Calendar API有効化
   - OAuth 2.0クライアント作成

4. **Render**
   - アカウント作成済み
   - GitHubアカウントと連携済み

---

## 環境変数の設定

### 必須の環境変数

以下の環境変数を`.env.local`（ローカル）または Render の Environment Variables（本番）に設定してください。

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend Email
RESEND_API_KEY=re_6Co2X8qg_4DDitqJ243sru92NpbbzxnSb
ADMIN_EMAIL=team@zettai.co.jp

# Google Calendar（オプション）
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_CALENDAR_IDS=primary

# NextAuth（セッション管理 - オプション）
NEXTAUTH_SECRET=your-random-secret-string
NEXTAUTH_URL=https://your-app.onrender.com
```

### 環境変数の取得方法

#### Supabase
1. Supabaseダッシュボード → Settings → API
2. `URL` → `NEXT_PUBLIC_SUPABASE_URL`にコピー
3. `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`にコピー
   ⚠️ **注意**: `anon key`ではなく`service_role key`を使用してください

#### Resend
1. Resendダッシュボード → API Keys
2. `API Key` → `RESEND_API_KEY`にコピー
3. 現在はテストモードで`team@zettai.co.jp`のみ送信可能

#### Google Calendar（オプション）
1. Google Cloud Console → APIs & Services → Credentials
2. OAuth 2.0 Client IDを作成
3. Client ID と Client Secret を取得

---

## ローカルでの動作確認

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、上記の環境変数を設定します。

### 3. Supabaseのセットアップ確認

```bash
npx tsx scripts/setup-supabase-simple.ts
```

**期待される出力**:
```
✅ OK (2件のスタッフ) - 担当者A, 担当者B
✅ OK (6件の商材) - 商材1-6
✅ OK (0件の予約)
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

サーバーが起動したら、以下のURLにアクセスします：
- **予約ページ**: http://localhost:3000/book/3
- **商材1**: http://localhost:3000/book/1
- **商材2**: http://localhost:3000/book/2
- **商材3**: http://localhost:3000/book/3
- **商材4**: http://localhost:3000/book/4
- **商材5**: http://localhost:3000/book/5
- **商材6**: http://localhost:3000/book/6

### 5. エンドツーエンドテストの実行

```bash
npx tsx scripts/test-booking-flow.ts
```

**期待される出力**:
```
🎉 全てのテストが成功しました!

✅ チェックリスト:
  ✓ 空き枠APIが正常に動作
  ✓ 予約作成APIが正常に動作
  ✓ Supabaseにデータが正しく保存
  ✓ ダブルブッキング防止が動作
  ✓ 予約後に空き枠が更新される
```

---

## Renderへのデプロイ

### 1. GitHubリポジトリの準備

リポジトリが`https://github.com/ZETTAI-INC/TImelex.git`にプッシュされていることを確認します。

```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Renderでの新規サービス作成

1. [Render Dashboard](https://dashboard.render.com/)にログイン
2. **New > Web Service**をクリック
3. GitHubリポジトリ`ZETTAI-INC/TImelex`を選択
   - ⚠️ リポジトリがプライベートの場合、Renderに GitHub アクセス権限を付与する必要があります

### 3. サービス設定

以下の設定を入力します：

| 項目 | 値 |
|------|-----|
| **Name** | `timrexplus` または任意の名前 |
| **Region** | `Singapore` または最寄りのリージョン |
| **Branch** | `main` |
| **Root Directory** | 空欄（プロジェクトルート） |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Free` または `Starter` |

### 4. 環境変数の設定

Render の **Environment Variables**セクションで、以下の環境変数を追加します：

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_6Co2X8qg_4DDitqJ243sru92NpbbzxnSb
ADMIN_EMAIL=team@zettai.co.jp
NODE_VERSION=18
```

### 5. デプロイの実行

**Create Web Service**ボタンをクリックして、デプロイを開始します。

デプロイには5〜10分かかります。ログを確認して、エラーがないことを確認してください。

---

## デプロイ後の確認

### 1. 本番環境へのアクセス

デプロイが完了したら、Renderが提供するURLにアクセスします：

```
https://timrexplus.onrender.com/book/3
```

### 2. 動作確認チェックリスト

- [ ] 予約ページが表示される
- [ ] 空き枠が正しく表示される
- [ ] スタッフA/Bの空き状況が表示される
- [ ] 時間選択→フォーム入力→アンケート→予約確定まで完了できる
- [ ] 予約後にSupabaseにデータが保存される
- [ ] `team@zettai.co.jp`にメール通知が届く

### 3. 本番環境でのテスト

```bash
# 本番環境のAPIをテスト
curl https://timrexplus.onrender.com/api/slots/simple?date=2025-11-14&consultation_type_id=3
```

---

## トラブルシューティング

### デプロイが失敗する

**症状**: ビルドエラーが発生する

**解決策**:
1. Renderのログを確認
2. `package.json`の`scripts`セクションに`build`コマンドがあることを確認
3. Node.jsバージョンを`18`に設定

```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### 環境変数が読み込まれない

**症状**: `Supabase credentials are missing`エラー

**解決策**:
1. Render Dashboard → Service → Environment
2. 環境変数が正しく設定されているか確認
3. 特に`NEXT_PUBLIC_`プレフィックスが必要な変数に注意

### 空き枠が表示されない

**症状**: 空き枠APIが空の配列を返す

**解決策**:
1. Supabaseに`staff`データが存在するか確認
2. `staff`の`is_active`が`true`になっているか確認
3. RLS（Row Level Security）が無効化されているか確認

### メールが届かない

**症状**: 予約後にメールが届かない

**解決策**:
1. Resendのテストモードでは`team@zettai.co.jp`のみ送信可能
2. Resend Dashboard → Emails で送信履歴を確認
3. `RESEND_API_KEY`が正しく設定されているか確認
4. 本番環境では独自ドメインを設定する必要があります

### ダブルブッキングが発生する

**症状**: 同じ時間に2件の予約が入る

**解決策**:
1. `lib/booking/availability.ts`の`isSlotAvailable`関数を確認
2. Supabaseの`bookings`テーブルにインデックスが設定されているか確認
3. トランザクション処理が正しく動作しているか確認

---

## 🔧 MCP使用状況宣言

**MCPサーバー: 使用していません**

このプロジェクトでは以下のツールのみを使用しています：
- `@supabase/supabase-js` - Supabaseクライアント
- `resend` - メール送信
- `next` - Next.js フレームワーク

---

## 📞 サポート

質問や問題がある場合は、以下に連絡してください：
- **Email**: team@zettai.co.jp
- **GitHub Issues**: https://github.com/ZETTAI-INC/TImelex/issues

---

## ✅ デプロイチェックリスト

最終確認用のチェックリストです。全ての項目にチェックを入れてからデプロイしてください。

### 準備
- [ ] Supabaseプロジェクトが作成済み
- [ ] テーブル（staff, consultation_types, bookings）が作成済み
- [ ] RLSが無効化されている
- [ ] Resend APIキーが取得済み
- [ ] GitHubリポジトリにコードがプッシュ済み

### 環境変数
- [ ] `NEXT_PUBLIC_SUPABASE_URL`が設定済み
- [ ] `SUPABASE_SERVICE_ROLE_KEY`が設定済み
- [ ] `RESEND_API_KEY`が設定済み
- [ ] `ADMIN_EMAIL`が設定済み

### ローカルテスト
- [ ] `npm run dev`でローカル起動成功
- [ ] `http://localhost:3000/book/3`にアクセス成功
- [ ] 予約フローが完全に動作
- [ ] `npx tsx scripts/test-booking-flow.ts`が成功

### Renderデプロイ
- [ ] Renderでサービス作成完了
- [ ] 環境変数が全て設定済み
- [ ] ビルドが成功
- [ ] デプロイが成功

### 本番環境確認
- [ ] 本番URLにアクセス成功
- [ ] 空き枠が表示される
- [ ] 予約作成が成功
- [ ] Supabaseにデータが保存される
- [ ] メール通知が届く

---

**最終更新**: 2025-11-13
**バージョン**: 1.0.0
