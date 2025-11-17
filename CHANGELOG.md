# 変更履歴

## 2025-11-17 - アンケート機能統合とUI改善

### 新機能

#### 1. アンケート機能の完全統合
- **相談種別とアンケートの紐付け**
  - 管理画面の相談種別編集ページでアンケートを選択可能に
  - ファイル: `app/admin/consultation-types/[id]/page.tsx`
  - 各相談種別に対して、特定のアンケートを割り当てられます

- **予約フローへのアンケート組み込み**
  - 予約時に相談種別に紐づくアンケートの質問が自動表示
  - ファイル: `components/booking/BookingForm.tsx`
  - 動的にAPIから質問を取得して表示

- **アンケート回答の保存**
  - 予約作成時に回答を自動保存
  - ファイル: `app/api/bookings/simple/route.ts`
  - データベーステーブル: `booking_answers`
  - テキスト回答: `answer_text` カラム
  - 複数選択回答: `answer_json` カラム

### UI/UX改善

#### 2. 絵文字の削除
全ての管理画面から絵文字を削除し、よりプロフェッショナルな見た目に統一
- 対象ページ:
  - `app/admin/page.tsx`
  - `app/admin/booking-urls/page.tsx`
  - `app/admin/settings/page.tsx`
  - `app/admin/questionnaires/page.tsx`
  - `app/admin/google-auth/page.tsx`
  - `app/admin/consultation-types/[id]/page.tsx`
  - `app/admin/consultation-types/new/page.tsx`
  - `app/book/page.tsx`

#### 3. モバイルレイアウト最適化
- カレンダーページのモバイル表示を改善
- ファイル: `app/admin/calendar/page.tsx`
- グリッドレイアウトの調整
- レスポンシブ対応の強化

### 管理機能

#### 4. 予約一括削除API
開発・テスト用に全予約を削除できるAPIエンドポイントを追加
- エンドポイント: `DELETE /api/admin/bookings/delete-all`
- ファイル: `app/api/admin/bookings/delete-all/route.ts`

### ドキュメント

#### 5. アンケート機能分析レポート
既存のアンケート機能の調査結果をまとめたドキュメントを作成
- ファイル: `QUESTIONNAIRE_ANALYSIS.md`
- データベーススキーマ
- API仕様
- 実装状況

## 技術的な詳細

### データベース
既存のテーブルを活用:
- `questionnaires`: アンケートテンプレート
- `questions`: アンケートの質問
- `booking_answers`: 予約に対する回答

### API変更
- `POST /api/bookings/simple`: `questionnaire_answers` パラメータを追加
- 回答データを `booking_answers` テーブルに自動保存

### フロントエンド
- 相談種別編集画面: アンケート選択ドロップダウンを追加
- 予約フォーム: 動的なアンケート質問表示
- バリデーション: 必須質問のチェック

## 今後の実装予定

### 次のステップ
1. クライアント管理機能
   - クライアント専用URL発行システム
   - クライアントテーブルの作成

2. アンケート回答の管理画面
   - 予約詳細画面でアンケート回答を表示
   - 回答のエクスポート機能

3. 相談種別選択フローの改善
   - 最初のステップとして相談種別を選択
   - より直感的なUI

## 既知の問題

### カレンダーページ
- コンパイルエラーが発生中（既存の問題）
- JSXコメントの構文エラー
- 今後修正予定
