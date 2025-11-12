# Google Meet 連携セットアップガイド
## contact@zettai.co.jp アカウント用

このガイドに従って、TIMREXPLUS で Google Meet を自動発行できるようにします。

---

## 📋 必要なもの

- Googleアカウント: `contact@zettai.co.jp`
- Google Workspace または個人Googleアカウント（Google Meetが使える）
- 管理者権限

---

## ステップ1: Google Cloud Console でプロジェクトを作成

### 1-1. Google Cloud Console にアクセス

```
https://console.cloud.google.com/
```

`contact@zettai.co.jp` でログインしてください。

### 1-2. 新しいプロジェクトを作成

1. 画面上部の「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名: **TIMREXPLUS**
4. 「作成」をクリック
5. 作成したプロジェクトを選択

---

## ステップ2: Google Calendar API を有効化

### 2-1. API ライブラリに移動

1. 左メニュー → 「API とサービス」 → 「ライブラリ」
2. 検索バーに **Google Calendar API** と入力
3. 「Google Calendar API」をクリック
4. **「有効にする」** ボタンをクリック

---

## ステップ3: OAuth 2.0 認証情報を作成

### 3-1. OAuth 同意画面の設定

1. 左メニュー → 「API とサービス」 → 「OAuth 同意画面」
2. User Type: **外部** を選択
3. 「作成」をクリック

**アプリ情報:**
- アプリ名: `TIMREXPLUS`
- ユーザーサポートメール: `contact@zettai.co.jp`
- デベロッパーの連絡先情報: `contact@zettai.co.jp`
- 「保存して次へ」

**スコープの追加:**
1. 「スコープを追加または削除」をクリック
2. 以下のスコープを手動で追加:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   ```
3. 「保存して次へ」

**テストユーザーの追加:**
1. 「+ ADD USERS」をクリック
2. `contact@zettai.co.jp` を追加
3. 「保存して次へ」

### 3-2. OAuth 2.0 クライアント ID を作成

1. 左メニュー → 「API とサービス」 → 「認証情報」
2. 「+ 認証情報を作成」 → 「OAuth クライアント ID」

**設定:**
- アプリケーションの種類: **ウェブ アプリケーション**
- 名前: `TIMREXPLUS Web Client`

**承認済みのリダイレクト URI:**

ローカル開発用:
```
http://localhost:3000/api/auth/callback/google
```

本番環境用（後で追加）:
```
https://yourdomain.com/api/auth/callback/google
```

3. 「作成」をクリック

### 3-3. 認証情報をコピー

ポップアップに表示される以下の情報をコピーしてください：

- **クライアント ID**: `1234567890-xxxxx.apps.googleusercontent.com` のような形式
- **クライアント シークレット**: `GOCSPX-xxxxx` のような形式

---

## ステップ4: 環境変数を設定

### 4-1. `.env.local` ファイルを開く

```bash
code .env.local
```

### 4-2. Google 認証情報を入力

以下の箇所を、先ほどコピーした値に置き換えてください：

```bash
# --------------------------------------------
# 🔐 Google OAuth & Calendar API
# --------------------------------------------

# ⚠️ ここにクライアント ID を貼り付け
GOOGLE_CLIENT_ID=あなたのクライアントID.apps.googleusercontent.com

# ⚠️ ここにクライアント シークレットを貼り付け
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット

# リダイレクト URI（ローカル開発用）
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 4-3. ファイルを保存

---

## ステップ5: 開発サーバーを再起動

```bash
# サーバーを停止（Ctrl+C）
# .next キャッシュを削除
rm -rf .next

# サーバーを再起動
npm run dev
```

---

## ステップ6: contact@zettai.co.jp と連携

### 6-1. 管理画面にアクセス

```
http://localhost:3000/admin
```

パスワード: `0000`

### 6-2. Google カレンダー連携

1. サイドメニューから「設定」をクリック
2. 「Google カレンダー連携」セクションを探す
3. **「Googleアカウントと連携」** ボタンをクリック

### 6-3. Google ログイン

1. Googleログイン画面が表示されます
2. **`contact@zettai.co.jp`** でログイン
3. 「このアプリは確認されていません」と表示される場合:
   - 「詳細」をクリック
   - 「TIMREXPLUS（安全ではないページ）に移動」をクリック
   - （テスト段階なので問題ありません）

### 6-4. 権限を許可

以下の権限を求められます：

- ✅ Google カレンダーの予定を表示・編集
- ✅ カレンダーの空き時間情報を確認

**「許可」をクリック**

### 6-5. 連携完了確認

管理画面に戻り、以下が表示されていれば成功です：

```
✅ Googleアカウント連携済み
contact@zettai.co.jp
```

---

## ステップ7: 動作確認（テスト予約）

### 7-1. 予約URLにアクセス

```
http://localhost:3000/book/1
```

### 7-2. 予約を完了

1. 日付を選択
2. 時間を選択
3. 情報を入力して予約を確定

### 7-3. 確認事項

予約完了後、以下を確認してください：

✅ **予約確認画面に Google Meet リンクが表示される**
```
https://meet.google.com/xxx-xxxx-xxx
```

✅ **contact@zettai.co.jp の Google カレンダーに予定が追加される**
- カレンダーを開く: https://calendar.google.com
- 作成した日時に予定が入っている
- 予定の詳細に「Google Meet に参加」リンクがある

✅ **予約者（テスト用のメールアドレス）に確認メールが届く**
- Google Meet URLが記載されている

---

## ✅ セットアップ完了！

これで、contact@zettai.co.jp のカレンダーに予約が自動的に追加され、Google Meet URLが自動発行されるようになりました。

---

## 🔧 トラブルシューティング

### エラー: "redirect_uri_mismatch"

**原因:** リダイレクト URI が登録されていない

**解決方法:**
1. Google Cloud Console → 認証情報
2. 作成した OAuth 2.0 クライアント ID をクリック
3. 「承認済みのリダイレクト URI」に以下を追加:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
4. 「保存」

### エラー: "Access blocked: This app's request is invalid"

**原因:** OAuth 同意画面の設定が不完全

**解決方法:**
1. OAuth 同意画面 → 「編集」
2. スコープが正しく追加されているか確認
3. テストユーザーに `contact@zettai.co.jp` が追加されているか確認

### Meet リンクが生成されない

**原因:** Calendar API の権限が不足

**解決方法:**
1. OAuth 同意画面のスコープを確認
2. 以下が含まれているか確認:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
3. 再度 Google アカウント連携をやり直す

### 「このアプリは確認されていません」が表示される

**原因:** テストモードのため（正常な動作）

**解決方法:**
- 「詳細」→「TIMREXPLUS（安全ではないページ）に移動」をクリック
- テストユーザーとして登録したアカウントでのみアクセス可能

---

## 📞 サポート

問題が解決しない場合:

1. `.env.local` の `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認
2. Google Cloud Console でプロジェクトが正しく選択されているか確認
3. API が有効化されているか確認（Google Calendar API）
4. 開発サーバーを再起動（`rm -rf .next && npm run dev`）

---

**最終更新**: 2025-11-12
