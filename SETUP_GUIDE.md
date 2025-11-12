# TIMREXPLUS セットアップガイド

このガイドでは、TIMREXPLUS予約システムを動かすための手順を説明します。

---

## 前提条件

- Node.js 18以上がインストールされていること
- GitHubアカウント
- Googleアカウント（Google Cloud Console用）

---

## 📋 セットアップチェックリスト

以下の順番で進めてください：

- [x] **ステップ1**: npm依存関係インストール（完了済み）
- [x] **ステップ2**: 環境変数ファイル作成（完了済み）
- [ ] **ステップ3**: Supabaseプロジェクト作成＆DB設定
- [ ] **ステップ4**: Google OAuth認証情報の取得
- [ ] **ステップ5**: Resend APIキーの取得
- [ ] **ステップ6**: 環境変数の設定
- [ ] **ステップ7**: ローカル起動＆動作確認

---

## ステップ3: Supabase（データベース）のセットアップ

### 3-1. Supabaseプロジェクト作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリックしてサインアップ
3. 「New Project」をクリック
4. 以下を入力：
   - **Name**: `timrexplus` (任意)
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: Free（開発用）
5. 「Create new project」をクリック（数分かかります）

### 3-2. データベースマイグレーションの実行

プロジェクト作成後、データベーステーブルを作成します。

1. Supabaseダッシュボードで **SQL Editor** を開く
2. 以下の3つのマイグレーションファイルを順番に実行：

#### マイグレーション1: 初期スキーマ

```bash
# ファイル: supabase/migrations/20250112_initial_schema.sql
```

1. 上記ファイルの内容をコピー
2. SQL Editorに貼り付け
3. 「Run」をクリック

#### マイグレーション2: リマインダーメール機能

```bash
# ファイル: supabase/migrations/20250112_add_email_reminders.sql
```

1. 上記ファイルの内容をコピー
2. SQL Editorに貼り付け
3. 「Run」をクリック

#### マイグレーション3: アンケート機能

```bash
# ファイル: supabase/migrations/20250112_add_questionnaires.sql
```

1. 上記ファイルの内容をコピー
2. SQL Editorに貼り付け
3. 「Run」をクリック

### 3-3. 認証情報の取得

1. Supabaseダッシュボードで **Settings** → **API** を開く
2. 以下の値をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon / public key**: `eyJhbGci...`（公開キー）
   - **service_role key**: `eyJhbGci...`（サーバー専用キー、絶対に公開しない）

3. **Settings** → **Database** → **Connection string** を開く
4. **URI** タブの接続文字列をコピー：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```

### 3-4. 環境変数に入力

`.env.local` ファイルを開き、以下の値を入力：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (service_role key)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## ステップ4: Google OAuth＆Calendar API のセットアップ

### 4-1. Google Cloud Consoleプロジェクト作成

1. https://console.cloud.google.com/ にアクセス
2. 上部の「プロジェクトを選択」→「新しいプロジェクト」をクリック
3. プロジェクト名: `TIMREXPLUS` (任意)
4. 「作成」をクリック

### 4-2. Google Calendar APIの有効化

1. 左メニューから **APIとサービス** → **ライブラリ** を開く
2. 「Google Calendar API」を検索
3. 「有効にする」をクリック

### 4-3. OAuth認証情報の作成

1. **APIとサービス** → **認証情報** を開く
2. 「認証情報を作成」→ **OAuth 2.0 クライアントID** を選択

3. OAuth同意画面が未設定の場合、「同意画面を構成」をクリック：
   - **User Type**: 外部（テスト用）
   - **アプリ名**: TIMREXPLUS
   - **ユーザーサポートメール**: あなたのメールアドレス
   - **デベロッパーの連絡先情報**: あなたのメールアドレス
   - スコープは設定不要（後で自動追加される）
   - 「保存して続行」を繰り返し

4. 再度「認証情報を作成」→ **OAuth 2.0 クライアントID**
   - **アプリケーションの種類**: ウェブアプリケーション
   - **名前**: TIMREXPLUS Web Client
   - **承認済みのリダイレクトURI**:
     - `http://localhost:3000/api/auth/callback/google` (ローカル開発用)
     - `https://yourdomain.com/api/auth/callback/google` (本番環境用、後で追加可)
   - 「作成」をクリック

5. **クライアントID** と **クライアントシークレット** が表示されるのでメモ

### 4-4. テストユーザーの追加

1. **OAuth同意画面** → **テストユーザー** を開く
2. 「ユーザーを追加」をクリック
3. スタッフのGoogleアカウントメールアドレスを追加

### 4-5. 環境変数に入力

`.env.local` ファイルを開き、以下の値を入力：

```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
```

---

## ステップ5: Resend（メール送信）のセットアップ

### 5-1. Resendアカウント作成

1. https://resend.com にアクセス
2. 「Sign Up」からアカウント作成（GitHubアカウントでサインアップ可）

### 5-2. APIキーの取得

1. ダッシュボードで **API Keys** を開く
2. 「Create API Key」をクリック
3. **Name**: `TIMREXPLUS`
4. **Permission**: Full Access
5. 「Add」をクリック
6. 表示されたAPIキーをコピー（`re_` で始まる文字列）

### 5-3. ドメイン認証（本番環境用）

**開発・テスト用**: この手順はスキップ可能（送信先が限定されます）

1. **Domains** → **Add Domain** をクリック
2. ドメイン名を入力（例: `yourdomain.com`）
3. 表示されたDNSレコードを、ドメイン管理サービス（お名前.com、Cloudflare等）に追加
4. 認証完了まで待つ（数分〜1時間）

### 5-4. 環境変数に入力

`.env.local` ファイルを開き、以下の値を入力：

```env
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=no-reply@yourdomain.com  # ドメイン認証済みのアドレス
EMAIL_REPLY_TO=support@yourdomain.com
```

**注意**: ドメイン認証していない場合、送信元は `onboarding@resend.dev` になり、送信先は登録メールアドレスのみに制限されます。

---

## ステップ6: 環境変数の最終確認

`.env.local` ファイルを開き、以下がすべて入力されているか確認：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=✅
SUPABASE_SERVICE_ROLE_KEY=✅
DATABASE_URL=✅

# Google
GOOGLE_CLIENT_ID=✅
GOOGLE_CLIENT_SECRET=✅

# Resend
RESEND_API_KEY=✅
EMAIL_FROM=✅

# 自動生成済み（変更不要）
NEXTAUTH_SECRET=✅
ENCRYPTION_KEY=✅
CRON_SECRET=✅
```

---

## ステップ7: ローカル起動＆動作確認

### 7-1. 開発サーバーの起動

```bash
npm run dev
```

以下のようなメッセージが表示されれば成功：

```
  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

### 7-2. 動作確認

ブラウザで http://localhost:3000 にアクセスし、以下を確認：

#### クライアント予約フロー
1. http://localhost:3000/book にアクセス
2. 相談種別を選択
3. 日時・時間帯を選択
4. クライアント情報を入力
5. 予約確定画面が表示されるか確認

#### スタッフポータル
1. http://localhost:3000/staff にアクセス
2. 「Sign in with Google」をクリック
3. Googleアカウントでログイン（テストユーザーとして登録したアカウント）
4. ダッシュボードが表示されるか確認

#### 管理者ポータル
1. http://localhost:3000/admin にアクセス
2. Googleアカウントでログイン
3. スタッフ管理・相談種別管理等が表示されるか確認

### 7-3. トラブルシューティング

#### エラー: `NEXT_PUBLIC_SUPABASE_URL is not defined`
→ `.env.local` ファイルが正しく配置されているか確認
→ 開発サーバーを再起動（Ctrl+C → `npm run dev`）

#### エラー: `Google OAuth redirect URI mismatch`
→ Google Cloud Consoleで設定したリダイレクトURIが `http://localhost:3000/api/auth/callback/google` になっているか確認

#### エラー: `Supabase connection failed`
→ SupabaseプロジェクトのURLとキーが正しいか確認
→ Supabaseプロジェクトが起動中か確認（ダッシュボードで確認）

#### エラー: メールが送信されない
→ Resend APIキーが正しいか確認
→ ドメイン認証していない場合、送信先が登録メールアドレスか確認

---

## 次のステップ

### 初期データの投入

アプリを使用する前に、以下の初期データを登録してください：

1. **スタッフの登録**:
   - 管理者ポータル → スタッフ管理 → 新規作成
   - スタッフAとスタッフBを作成
   - Google Calendar ID を入力（Gmail: `your-email@gmail.com`）

2. **相談種別の登録**:
   - 管理者ポータル → 相談種別管理 → 新規作成
   - 例: 「初回相談（60分）」「追加相談（30分）」

3. **お問い合わせ元の登録**:
   - 管理者ポータル → お問い合わせ元管理 → 新規作成
   - 例: 「公式サイト」「Facebook」「Instagram」

### 本番デプロイ

Vercelにデプロイする手順：

1. https://vercel.com にアクセスしてサインアップ
2. GitHubリポジトリを接続
3. 環境変数をVercelダッシュボードで設定（`.env.local` の内容をコピー）
4. デプロイ実行
5. Google Cloud ConsoleでリダイレクトURIに本番URLを追加

---

## サポート

問題が発生した場合は、GitHubリポジトリのIssueで報告してください：
https://github.com/ZETTAI-INC/TImelex/issues

---

**最終更新**: 2025-11-12
