# Google Calendar連携セットアップガイド

このガイドでは、TIMREXPLUSでGoogle Calendarのリアルタイム空き枠確認機能を有効にする方法を説明します。

## 📋 前提条件

- Google Cloud Platformアカウント
- 管理者権限のあるGoogleカレンダー

## 🚀 セットアップ手順

### 1. Google Cloud Consoleでプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成（例: `timrexplus-calendar`）
3. プロジェクトを選択

### 2. Calendar APIを有効化

1. 左メニューから「APIとサービス」→「ライブラリ」を選択
2. "Google Calendar API"を検索
3. 「有効にする」をクリック

### 3. サービスアカウントを作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「サービスアカウント」を選択
3. サービスアカウント名を入力（例: `timrexplus-calendar-service`）
4. 「作成して続行」をクリック
5. ロールは「なし」でOK（カレンダー共有で権限を付与するため）
6. 「完了」をクリック

### 4. サービスアカウントキーを作成

1. 作成したサービスアカウントをクリック
2. 「キー」タブを選択
3. 「鍵を追加」→「新しい鍵を作成」
4. JSONを選択して「作成」
5. JSONファイルがダウンロードされます（大切に保管してください）

### 5. カレンダーをサービスアカウントと共有

1. [Google Calendar](https://calendar.google.com/)にアクセス
2. 使用するカレンダーの「設定と共有」を開く
3. 「特定のユーザーとの共有」セクションで「ユーザーを追加」
4. サービスアカウントのメールアドレスを入力
   - メールアドレスは `サービスアカウント名@プロジェクトID.iam.gserviceaccount.com` の形式
   - 例: `timrexplus-calendar-service@timrexplus-calendar.iam.gserviceaccount.com`
5. 権限を「予定の変更権限」に設定
6. 「送信」をクリック

### 6. カレンダーIDを取得

1. Google Calendarで使用するカレンダーの「設定と共有」を開く
2. 「カレンダーの統合」セクションで「カレンダーID」をコピー
   - 例: `contact@zettai.co.jp` または `xxxxxxxxxx@group.calendar.google.com`

### 7. 環境変数を設定

`.env.local`ファイルに以下を追加します：

```bash
# Google Calendar API設定
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# カレンダーID（複数の場合はカンマ区切り）
GOOGLE_CALENDAR_IDS=contact@zettai.co.jp,staff2@zettai.co.jp
```

**重要**:
- `GOOGLE_SERVICE_ACCOUNT_KEY`には、ダウンロードしたJSONファイルの内容を**1行**で貼り付けてください
- 改行は`\n`に置き換えられている必要があります
- シングルクォートで囲んでください

### 8. 動作確認

サーバーを再起動して、以下を確認してください：

1. **空き枠の確認**: 予約ページで実際のカレンダーの空き枠が表示されること
2. **予約の作成**: 予約を作成すると、Google Calendarにイベントが追加されること
3. **Google Meet**: イベントにGoogle Meetリンクが自動生成されること

## 🧪 テスト方法

### APIで空き枠を取得してテスト

```bash
curl http://localhost:3000/api/slots/simple?date=2025-11-20&type=1
```

レスポンス例：
```json
{
  "slots": [
    {"time": "2025-11-20T09:00:00.000Z", "availableStaff": [{"id": "staff-1", "name": "担当者"}]},
    {"time": "2025-11-20T09:30:00.000Z", "availableStaff": []},
    ...
  ]
}
```

### 予約を作成してテスト

```bash
./test-booking-api-product3.sh
```

確認事項：
- ✅ Google Calendarにイベントが追加される
- ✅ イベントにGoogle Meetリンクが含まれる
- ✅ 管理者にメール通知が届く

## ⚠️ トラブルシューティング

### エラー: "GOOGLE_SERVICE_ACCOUNT_KEY not set, using mock data"

**原因**: 環境変数が正しく設定されていない

**対処**:
1. `.env.local`に`GOOGLE_SERVICE_ACCOUNT_KEY`が存在することを確認
2. JSONが正しく1行で貼り付けられていることを確認
3. サーバーを再起動

### エラー: "Failed to initialize Google Calendar client"

**原因**: サービスアカウントキーのJSON形式が不正

**対処**:
1. JSONファイルの内容をコピーし直す
2. 改行やスペースが余分に入っていないか確認
3. シングルクォートで囲まれているか確認

### エラー: "Calendar event creation failed"

**原因**: カレンダーがサービスアカウントと共有されていない、またはカレンダーIDが間違っている

**対処**:
1. Google Calendarでサービスアカウントが正しく共有されているか確認
2. 権限が「予定の変更権限」になっているか確認
3. カレンダーIDが正しいか確認

### 空き枠がモックデータのまま

**原因**: 環境変数が正しく読み込まれていない、またはカレンダーIDが設定されていない

**対処**:
1. `GOOGLE_CALENDAR_IDS`が設定されているか確認
2. カレンダーIDが正しいか確認（カンマ区切りで複数指定可能）
3. サーバーを再起動

## 📝 本番環境（Render）での設定

Renderで環境変数を設定する場合：

1. Renderダッシュボードでサービスを選択
2. 「Environment」タブを開く
3. 以下の環境変数を追加：
   - `GOOGLE_SERVICE_ACCOUNT_KEY`: JSONファイルの内容（1行）
   - `GOOGLE_CALENDAR_IDS`: カレンダーID（カンマ区切り）

**注意**: Renderでは環境変数に改行を含めることができるため、JSONをそのまま貼り付けてもOKです。

## 🔒 セキュリティのベストプラクティス

1. **サービスアカウントキーの保管**
   - JSONファイルはGitにコミットしない
   - `.gitignore`に`*.json`を追加
   - 環境変数で管理する

2. **最小権限の原則**
   - サービスアカウントには必要最小限の権限のみを付与
   - カレンダー共有は「予定の変更権限」のみ

3. **定期的なローテーション**
   - サービスアカウントキーは定期的に再生成
   - 古いキーは削除

## 📚 参考リンク

- [Google Calendar API リファレンス](https://developers.google.com/calendar/api/v3/reference)
- [サービスアカウントの作成と管理](https://cloud.google.com/iam/docs/service-accounts-create)
- [Google Workspace API認証](https://developers.google.com/workspace/guides/auth-overview)

## ✅ チェックリスト

設定完了前に以下を確認してください：

- [ ] Google Cloud Consoleでプロジェクトを作成
- [ ] Calendar APIを有効化
- [ ] サービスアカウントを作成
- [ ] サービスアカウントキー（JSON）をダウンロード
- [ ] カレンダーをサービスアカウントと共有
- [ ] カレンダーIDを取得
- [ ] `.env.local`に環境変数を設定
- [ ] サーバーを再起動
- [ ] 空き枠の取得をテスト
- [ ] 予約作成をテスト
- [ ] Google Calendarにイベントが追加されることを確認
- [ ] Google Meetリンクが生成されることを確認

---

**最終更新**: 2025-11-13
**バージョン**: 1.0
