# Google Calendar & Meet API 連携ガイド

このガイドでは、TIMREXPLUS と Google Calendar / Google Meet を連携するための手順を説明します。

---

## 📋 目次

1. [Google Cloud Console でプロジェクトを作成](#1-google-cloud-console-でプロジェクトを作成)
2. [Google Calendar API を有効化](#2-google-calendar-api-を有効化)
3. [OAuth 2.0 認証情報を作成](#3-oauth-20-認証情報を作成)
4. [環境変数に設定](#4-環境変数に設定)
5. [動作確認](#5-動作確認)

---

## 1. Google Cloud Console でプロジェクトを作成

### 手順

1. **Google Cloud Console にアクセス**
   - https://console.cloud.google.com/

2. **新しいプロジェクトを作成**
   - 画面上部の「プロジェクトを選択」をクリック
   - 「新しいプロジェクト」をクリック
   - プロジェクト名: `TIMREXPLUS` （任意）
   - 「作成」をクリック

3. **プロジェクトを選択**
   - 作成したプロジェクトを選択状態にする

---

## 2. Google Calendar API を有効化

### 手順

1. **API とサービス > ライブラリ に移動**
   - 左メニューから「API とサービス」→「ライブラリ」を選択

2. **Google Calendar API を検索**
   - 検索バーに「Google Calendar API」と入力
   - 「Google Calendar API」をクリック

3. **API を有効化**
   - 「有効にする」ボタンをクリック

---

## 3. OAuth 2.0 認証情報を作成

### 手順

1. **認証情報ページに移動**
   - 左メニューから「API とサービス」→「認証情報」を選択

2. **OAuth 同意画面の設定**
   - 「OAuth 同意画面」タブをクリック
   - User Type: **内部** を選択（組織内のみ）
     - または **外部** を選択（一般公開する場合）
   - 「作成」をクリック

   **アプリ情報の入力:**
   - アプリ名: `TIMREXPLUS`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
   - 「保存して次へ」をクリック

   **スコープの追加:**
   - 「スコープを追加または削除」をクリック
   - 以下のスコープを追加:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
   - 「保存して次へ」をクリック

   **テストユーザーの追加（外部の場合）:**
   - テストユーザーのメールアドレスを追加
   - 「保存して次へ」をクリック

3. **OAuth 2.0 クライアント ID を作成**
   - 「認証情報」タブに戻る
   - 「+ 認証情報を作成」→「OAuth クライアント ID」を選択

   **アプリケーションの種類:**
   - 「ウェブ アプリケーション」を選択

   **名前:**
   - `TIMREXPLUS Web Client`（任意）

   **承認済みのリダイレクト URI:**
   - ローカル開発用:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - 本番環境用（後で追加）:
     ```
     https://yourdomain.com/api/auth/callback/google
     ```

   - 「作成」をクリック

4. **クライアント ID とシークレットをコピー**
   - ポップアップに表示される以下の情報をコピー:
     - **クライアント ID** (例: `123456789.apps.googleusercontent.com`)
     - **クライアント シークレット** (例: `GOCSPX-xxxxx`)
   - 「OK」をクリック

---

## 4. 環境変数に設定

### 手順

1. **`.env.local` ファイルを開く**
   ```bash
   code .env.local
   ```

2. **Google 認証情報を設定**

   `.env.local` ファイルの以下の箇所を更新:

   ```bash
   # --------------------------------------------
   # 🔐 Google OAuth & Calendar API
   # --------------------------------------------

   # ⚠️ ここにコピーしたクライアント ID を貼り付け
   GOOGLE_CLIENT_ID=あなたのクライアントID.apps.googleusercontent.com

   # ⚠️ ここにコピーしたクライアント シークレットを貼り付け
   GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット

   # リダイレクト URI（ローカル開発用）
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
   ```

3. **ファイルを保存**

---

## 5. 動作確認

### 手順

1. **開発サーバーを再起動**
   ```bash
   npm run dev
   ```

2. **管理画面にアクセス**
   ```
   http://localhost:3000/admin
   ```
   - パスワード: `0000`

3. **Google アカウントと連携**
   - 「設定」→「Google カレンダー連携」
   - 「Googleアカウントと連携」ボタンをクリック
   - Googleログイン画面が表示されるので、アカウントを選択
   - 権限の許可を求められるので「許可」をクリック

4. **予約テスト**
   - 予約URL（例: `http://localhost:3000/book/1`）にアクセス
   - 日付・時間を選択して予約を完了
   - Google カレンダーに予定が自動追加されることを確認
   - Google Meet リンクが自動発行されることを確認

---

## ✅ 完了！

これで Google Calendar と Google Meet の連携が完了しました。

### 次のステップ

- **本番環境へのデプロイ時**:
  - Google Cloud Console で本番環境のリダイレクト URI を追加
  - Vercel の環境変数に `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` を設定

---

## 🔧 トラブルシューティング

### エラー: "redirect_uri_mismatch"

**原因**: リダイレクト URI が Google Cloud Console で登録されていない

**解決方法**:
1. Google Cloud Console の「認証情報」に戻る
2. 作成した OAuth 2.0 クライアント ID をクリック
3. 「承認済みのリダイレクト URI」に以下を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. 「保存」をクリック

### エラー: "Access blocked: This app's request is invalid"

**原因**: OAuth 同意画面の設定が不完全

**解決方法**:
1. Google Cloud Console の「OAuth 同意画面」に戻る
2. 必要なスコープが追加されているか確認
3. テストユーザー（外部の場合）が追加されているか確認

### Meet リンクが生成されない

**原因**: Calendar API の権限が不足している

**解決方法**:
1. OAuth 同意画面のスコープに以下が含まれているか確認:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
2. 再度 Google アカウントと連携し直す

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください:
- Google Cloud Console でプロジェクトが正しく選択されているか
- API が有効化されているか
- `.env.local` の設定が正しいか
- 開発サーバーを再起動したか
