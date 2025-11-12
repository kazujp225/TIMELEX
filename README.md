# TIMREXPLUS

**スタッフA/B対応・即時確定型オンライン予約システム**

[![Version](https://img.shields.io/badge/version-2.2-blue.svg)](./plan.md)
[![Status](https://img.shields.io/badge/status-requirements-green.svg)](./Claude.md)

---

## 🎯 プロジェクト概要

TimeRex/Calendlyのような直感的な予約体験を、社内運用に最適化したオンライン予約システム。

### 主な特徴

- ✅ **即時確定**: 3ステップ以内で予約完了
- ✅ **統合スケジュール**: 単一URLで複数スタッフの空き枠を表示
- ✅ **自動化**: Google Meet自動発行、通知送信まで完結
- ✅ **追跡**: UTM/リファラでマーケティング効果測定
- ✅ **継続顧客**: 30日以内の再訪顧客を自動識別

---

## 📚 ドキュメント

プロジェクトの全体構造、役割別ガイド、クイックリファレンスは以下をご覧ください：

### 🏠 [Claude.md - プロジェクト索引](./Claude.md)

プロジェクトの親ドキュメント。以下の情報が含まれています：
- プロジェクト全体の構成
- 役割別ガイド（誰が何を読むべきか）
- 開発フェーズガイド
- クイックリファレンス
- FAQ

### 📄 [plan.md - 要件定義書 v2.2](./plan.md)

詳細な要件定義書。以下の内容を網羅：
- エグゼクティブサマリー
- ユーザー体験設計（UI/UX）
- 機能要件（FR-01〜FR-76）
- 非機能要件（性能、セキュリティ、可用性）
- データモデル概要
- 運用要件

---

## 🚀 クイックスタート

### 役割別の推奨ドキュメント

| 役割 | 最初に読むべきドキュメント |
|------|------------------------|
| **プロダクトオーナー / 経営層** | [plan.md - エグゼクティブサマリー](./plan.md#1-エグゼクティブサマリー) |
| **UI/UXデザイナー** | [plan.md - UI/UX要件](./plan.md#6-uiux要件) |
| **フロントエンド開発者** | [plan.md - 機能要件 7.1〜7.3](./plan.md#71-予約フロークライアント側) |
| **バックエンド開発者** | [plan.md - データモデル概要](./plan.md#96-データモデル概要) |
| **QAエンジニア** | [plan.md - 受け入れ基準](./plan.md#11-受け入れ基準mvp) |
| **運用チーム** | [plan.md - 運用要件](./plan.md#10-運用要件) |

詳細は [Claude.md - 役割別ガイド](./Claude.md#-役割別ガイド) を参照してください。

---

## 📊 プロジェクトステータス

| フェーズ | ステータス | 完了日 |
|---------|----------|--------|
| 企画・要件定義 | ✅ 完了 | 2025-11-11 |
| 設計 | ✅ 完了 | 2025-11-12 |
| 開発（Phase 1 MVP） | ✅ 完了 | 2025-11-12 |
| 開発（Phase 2-3 管理機能） | ✅ 完了 | 2025-11-12 |
| 開発（Phase 4 セキュリティ） | ✅ 完了 | 2025-11-12 |
| 開発（Phase 5 リマインダー） | ✅ 完了 | 2025-11-12 |
| 開発（Phase 6 アンケート） | ✅ 完了（モックベース） | 2025-11-12 |
| テスト・QA | ⏳ 未着手 | - |
| リリース準備 | ⏳ 未着手 | - |

### 実装済み機能（Phase 1 MVP）
- ✅ プロジェクトセットアップ（Next.js 14 + TypeScript）
- ✅ デザインシステム実装（人間らしいUI、モバイルファースト）
- ✅ データベーススキーマ設計（PostgreSQL + Supabase）
- ✅ 型定義とバリデーション（TypeScript + Zod）
- ✅ Google OAuth認証（NextAuth.js）
- ✅ Google Calendar API連携
  - FreeBusy APIで空き時間取得
  - Events APIでイベント管理
  - Google Meet自動発行
- ✅ 予約フロー（クライアント側UI）
  - カレンダー画面（日時選択）
  - 入力フォーム（クライアント情報）
  - 完了画面（予約確定）
- ✅ バックエンドAPI
  - 空き枠取得API
  - 予約作成・キャンセルAPI
  - スタッフ用予約管理API
- ✅ メール送信機能（Resend）
  - クライアント向け確定メール
  - スタッフ向け通知メール
  - キャンセル通知メール
- ✅ **スタッフポータル**
  - ログイン（Google OAuth）
  - ダッシュボード（統計・今日の予約）
  - 予約一覧（検索・フィルタ機能）
  - カレンダービュー（週間表示）
- ✅ **管理者ポータル（新規追加）**
  - ログイン（Google OAuth）
  - 管理ダッシュボード（システム全体の統計）
  - スタッフ管理（CRUD）
  - 相談種別管理（CRUD）
  - お問い合わせ元管理（CRUD）
  - システム設定管理
  - レポート・分析（お問い合わせ元別、相談種別別、スタッフ別、UTM別）
  - CSVエクスポート機能
- ✅ エラーハンドリング
  - 404/500エラーページ
  - スケルトンローディング

- ✅ **Phase 4: セキュリティ・品質**
  - データ暗号化（AES-256-GCM）
  - CSRF保護ミドルウェア
  - APIレート制限
  - 監査ログシステム
  - E2Eテスト（Playwright）
  - ユニットテスト（Jest）

- ✅ **Phase 5: リマインダーメール**
  - 24時間前リマインドメール
  - 30分前リマインドメール
  - メール送信履歴管理
  - リマインダー設定（個別ON/OFF可能）
  - Cron Job API（Vercel Cron統合）
  - 美しいHTMLメールテンプレート

- ✅ **Phase 6: 事前アンケート機能（モックベース完了）**
  - ✅ データベーススキーマ（questionnaires, questions, booking_answers）
  - ✅ アンケート管理API（CRUD）
  - ✅ 質問管理API（CRUD）
  - ✅ 管理画面ナビゲーション追加
  - ✅ 管理画面UI（アンケート一覧・作成・編集）
    - 一覧ページ（検索・フィルタ・並び替え）
    - 作成・編集フォーム（質問ビルダー）
    - 5種類の質問タイプ対応
    - 動的な質問追加・削除・並び替え
  - ✅ 予約フォームでアンケート表示（モックデータ）
    - 3つのサンプル質問を表示
    - バリデーション機能
  - ✅ スタッフポータル回答表示コンポーネント
  - ⏳ 回答保存API（実装予定）
  - ⏳ 実データ連携（実装予定）

- ✅ **UX改善（Phase 6拡張）**
  - ✅ Toastノティフィケーションシステム（sonner）
    - 非侵襲的なフィードバック表示
    - 確認ダイアログの改善（アクションボタン付き）
    - カスタムスタイリング（プロジェクトカラー適用）
  - ✅ オートセーブ機能
    - 2秒ごとの自動保存（localStorage）
    - ドラフト復元機能
    - 保存時刻表示（緑色のパルスアニメーション）
  - ✅ スケルトンローディング
    - アンケート一覧の読み込み状態
    - 3つのスケルトンカードで待機時間を視覚化
  - ✅ スムーズアニメーション・トランジション
    - ページコンテンツのフェードイン
    - リストアイテムのスタガードアニメーション（50ms遅延）
    - ボタンホバーエフェクト（スケール110%、シャドウ）
    - 質問カードのホバーエフェクト
    - 入力フォーカス時のリングエフェクト
  - ✅ 空状態の改善
    - アイコン付き空状態デザイン
    - 説明テキストとCTA（Call to Action）
    - アニメーション付きエンプティステート
  - ✅ アンケートプレビュー機能
    - モーダルダイアログでプレビュー表示
    - 全質問タイプの動作確認
    - リアルタイム入力体験
    - クライアント視点の確認が可能

### 開発予定（Phase 7以降）
- ⏳ Webhook連携（Slack等）
- ⏳ パフォーマンス最適化（Redis、画像最適化等）
- ⏳ SMS通知（Twilio連携）

---

## 🎨 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui（カスタマイズ）
- **Form Validation**: Zod
- **Date Utils**: date-fns, date-fns-tz
- **Icons**: lucide-react
- **Notifications**: sonner（Toast通知）

### バックエンド
- **Runtime**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Supabase Client
- **Authentication**: NextAuth.js
- **Encryption**: crypto-js (AES-256-GCM)

### 外部連携
- **Calendar**: Google Calendar API
- **Video**: Google Meet
- **Email**: Resend
- **Analytics**: UTM追跡、独自実装

### デプロイ
- **Hosting**: Vercel（推奨）
- **Database**: Supabase（マネージドPostgreSQL）
- **Environment**: Node.js 18.17+

---

## 📈 KPI目標

| 指標 | 現状 | 目標 |
|------|------|------|
| 予約確定までの時間 | 1〜2日 | 3分以内 |
| 予約完了率 | 推定40% | 60%以上 |
| No-show率 | - | 5%以下 |
| 継続率（30日以内再予約） | - | 20%以上 |

詳細は [plan.md - 成功指標（KPI）](./plan.md#12-成功指標kpi) を参照してください。

---

## 🚀 セットアップ

### 前提条件
- Node.js 18.17以上
- npm 9.0以上
- Supabaseアカウント（データベース）
- Googleアカウント（OAuth & Calendar API）
- Resendアカウント（メール送信）

### 🚀 クイックセットアップ

詳細な手順は **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** を参照してください。

### 1. リポジトリのクローン

```bash
git clone https://github.com/ZETTAI-INC/TUMELEXPLUS.git
cd TUMELEXPLUS
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 外部サービスのセットアップ

以下の3つのサービスで認証情報を取得（各5-10分）：

1. **Supabase** (データベース): https://supabase.com
2. **Google Cloud Console** (OAuth & Calendar API): https://console.cloud.google.com
3. **Resend** (メール送信): https://resend.com

詳細な手順は **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** を参照してください。

### 4. 環境変数の設定

`.env.local` ファイルに取得した認証情報を入力：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Google
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Resend
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=no-reply@yourdomain.com

# （その他は自動生成済み）
```

### 5. データベースマイグレーション実行

Supabase SQL Editorで以下を順番に実行：
1. `supabase/migrations/20250112_initial_schema.sql`
2. `supabase/migrations/20250112_add_email_reminders.sql`
3. `supabase/migrations/20250112_add_questionnaires.sql`

### 6. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーション起動

### トラブルシューティング

問題が発生した場合は **[SETUP_GUIDE.md - トラブルシューティング](./SETUP_GUIDE.md#73-トラブルシューティング)** を参照してください。

---

## 🔧 開発に参加する

### ドキュメントの読み方

1. まず [Claude.md](./Claude.md) でプロジェクト全体を把握
2. あなたの役割に応じて [plan.md](./plan.md) の該当セクションを確認
3. 実装時は [Claude.md - クイックリファレンス](./Claude.md#-クイックリファレンス) で設定値を参照

### プロジェクト構造

```
TIMREXPLUS/
├── app/                    # Next.js App Router
│   ├── book/              # 予約ページ
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # トップページ
├── components/            # Reactコンポーネント
│   ├── booking/           # 予約フロー
│   └── ui/                # UIコンポーネントライブラリ
├── lib/                   # ユーティリティ関数
│   ├── supabase/          # Supabaseクライアント
│   ├── utils.ts           # 共通関数
│   └── validations.ts     # Zodスキーマ
├── types/                 # TypeScript型定義
├── supabase/              # データベース
│   └── migrations/        # SQLマイグレーション
├── public/                # 静的ファイル
└── README.md             # 本ドキュメント
```

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `claude/*`: Claude Codeによる自動ブランチ

### コミットメッセージ

```
<type>: <subject>

<body>
```

**Type**: feat, fix, docs, style, refactor, test, chore

---

## 📞 お問い合わせ

- **プロジェクトリポジトリ**: https://github.com/ZETTAI-INC/TUMELEXPLUS
- **Issue**: 質問・バグ報告は Issue で受け付けています
- **Pull Request**: ドキュメントの改善提案を歓迎します

---

## 📄 ライセンス

[ライセンス情報を記載予定]

---

## 📝 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| v2.2 | 2025-11-11 | 要件定義書具体化・詳細化 |
| v2.1 | 2025-11-11 | 要件定義書改善・整理 |
| v2.0 | - | 要件定義書初版 |

---

**最終更新**: 2025-11-12
