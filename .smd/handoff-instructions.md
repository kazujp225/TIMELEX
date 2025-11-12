# 次のClaudeへの引き継ぎ指示書

**作成日**: 2025-11-12
**プロジェクト**: TIMREXPLUS
**リポジトリ**: https://github.com/ZETTAI-INC/TImelex
**開発サーバー**: http://localhost:3001

---

## 📋 プロジェクト概要

TimeRex/Calendlyのような予約体験を社内運用に最適化したオンライン予約システム。
クライアントが予約URLから空き枠を選び、その場で予約確定、Google Meetリンクが自動発行される。

### 技術スタック
- **フレームワーク**: Next.js 14.2.33 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: NextAuth.js (一時的に無効化中)
- **UI**: shadcn/ui + Radix UI

---

## 🎯 直前の作業内容

### 1. モバイルUI最適化 (360-414px対応)
**完了したタスク**:
- ✅ グローバルCSS設定（横スクロール防止、ビューポート設定）
- ✅ タップターゲット最適化（44px以上）
- ✅ ドロップダウンメニュー重なり修正
- ✅ 管理画面5ページのレスポンシブ対応
  - `/admin/staff` (スタッフ管理)
  - `/admin/consultation-types` (相談種別管理)
  - `/admin/questionnaires` (アンケート管理)
  - `/admin/inquiry-sources` (お問い合わせ元管理)
  - `/admin/reports` (レポート・分析)
- ✅ 未実装ページ作成（相談種別追加/編集、アンケート編集）

**適用したレスポンシブパターン**:
```tsx
// Typography
text-2xl sm:text-3xl md:text-4xl  // 見出し
text-base sm:text-lg              // サブ見出し
text-xl sm:text-2xl               // カードタイトル

// Buttons & Inputs
h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base
w-full sm:w-auto                   // モバイルで全幅

// Layout
space-y-4 sm:space-y-8            // 縦スペーシング
grid-cols-2 md:grid-cols-5        // グリッド
flex-col sm:flex-row              // フレックス方向

// Dropdowns
max-h-[200px] overflow-y-auto     // Select高さ制限
```

### 2. プロジェクト名の統一
- ✅ `TUMELEX` / `TUMELEXPLUS` → `TIMREXPLUS` に統一
- ✅ サイドバーロゴ更新: `components/layout/DarkSidebar.tsx:67`
- ✅ 全ドキュメント（12ファイル）の名称統一
- ✅ GitHubリポジトリURL更新

### 3. ログインページの一時無効化
- ✅ `/staff/login` → `/staff` に自動リダイレクト
- ✅ `/admin/login` → `/admin` に自動リダイレクト
- 開発中はログインフォームをスキップ

### 4. デバッグ表示の非表示化
- ✅ 予約ページ（`/book`）の右上「📊 追跡データ」を非表示
- トラッキング機能は裏で稼働中

### 5. ChunkLoadError解消
- ✅ `.next` キャッシュディレクトリを削除して再ビルド
- 開発サーバーは正常稼働中

---

## 🚧 保留中のタスク

### 優先度: 高

#### 1. ZettAIロゴの追加
**状況**: ロゴ画像ファイルの提供待ち

**実装予定箇所**:
1. **サイドバー** (`components/layout/DarkSidebar.tsx:67`)
   - 現在: テキスト「TIMREXPLUS」のみ
   - 変更後: ロゴ画像 + テキスト（またはロゴのみ）

2. **予約ページヘッダー** (`app/book/page.tsx`)
   - クライアント向けページの上部にロゴ表示

3. **ファビコン** (`public/favicon.ico`)
   - ブラウザタブのアイコン

**必要なファイル**:
```
public/
  images/
    zettai-logo.png    # 通常版（透過背景推奨）
    zettai-logo.svg    # SVG版（拡大縮小に最適）
  favicon.ico          # 16x16, 32x32, 48x48のマルチサイズ
```

**実装例**:
```tsx
// DarkSidebar.tsx
<div className="flex items-center h-16 px-6 border-b border-gray-700/50">
  <Link href={`/${role}`} className="flex items-center gap-3">
    <Image
      src="/images/zettai-logo.png"
      alt="ZettAI"
      width={32}
      height={32}
      className="object-contain"
    />
    <h1 className="text-xl font-bold bg-gradient-to-r from-[#6EC5FF] to-[#FFC870] bg-clip-text text-transparent">
      TIMREXPLUS
    </h1>
  </Link>
</div>
```

#### 2. タイポグラフィの統一（clamp関数）
**目的**: ビューポートに応じて滑らかにフォントサイズを変更

**実装例**:
```css
/* globals.css */
.text-responsive-xl {
  font-size: clamp(1.5rem, 2vw + 1rem, 2.5rem);
}

.text-responsive-lg {
  font-size: clamp(1.125rem, 1.5vw + 0.75rem, 1.5rem);
}
```

#### 3. モバイルUI検証ログ作成
**目的**: 360-414pxでの表示確認結果を記録

**チェック項目**:
- [ ] 横スクロールの発生確認
- [ ] タップターゲットサイズ（44px以上）
- [ ] テキストの可読性
- [ ] ドロップダウンの動作
- [ ] フォームの入力しやすさ
- [ ] ボタンの押しやすさ

**テスト端末**:
- iPhone SE (375px)
- Galaxy S8 (360px)
- iPhone 12 Pro (390px)
- Pixel 5 (393px)

---

## 📂 重要なファイル・ディレクトリ

### ドキュメント
```
/
├── Claude.md                          # プロジェクト全体の索引（必読）
├── plan.md                            # 要件定義書 v2.2
├── .smd/
│   ├── mobile-ui-optimization-progress.md  # モバイルUI最適化の進捗
│   └── handoff-instructions.md        # 本ファイル
```

### コンポーネント
```
components/
├── layout/
│   ├── DarkSidebar.tsx               # サイドバー（ロゴ追加予定）
│   ├── README.md                     # サイドバーの仕様書
│   └── VISUAL_GUIDE.md               # ビジュアルガイド
```

### アプリケーション
```
app/
├── book/page.tsx                     # 予約ページ（ロゴ追加予定）
├── staff/
│   ├── login/page.tsx                # スタッフログイン（一時無効化）
│   └── page.tsx                      # スタッフダッシュボード
├── admin/
│   ├── login/page.tsx                # 管理者ログイン（一時無効化）
│   ├── staff/page.tsx                # スタッフ管理（モバイル対応済み）
│   ├── consultation-types/page.tsx   # 相談種別管理（モバイル対応済み）
│   ├── questionnaires/page.tsx       # アンケート管理（モバイル対応済み）
│   ├── inquiry-sources/page.tsx      # お問い合わせ元管理（モバイル対応済み）
│   └── reports/page.tsx              # レポート・分析（モバイル対応済み）
└── globals.css                       # グローバルスタイル（モバイル最適化済み）
```

---

## 🔧 開発環境

### サーバー起動
```bash
npm run dev
# → http://localhost:3001 (ポート3000が使用中の場合)
```

### キャッシュクリア（ChunkLoadError時）
```bash
rm -rf .next
npm run dev
```

### Git操作
```bash
# 現在のブランチ
git branch
# → main

# 最新の状態を取得
git pull origin main

# 変更をコミット
git add .
git commit -m "コミットメッセージ"
git push origin main
```

---

## 🎨 デザインシステム

### カラーパレット
```css
/* メインカラー */
#6EC5FF  /* 優しい青 */
#FFC870  /* サンセットイエロー（アクセント） */

/* ステータス */
#FF7676  /* エラー（ピンクレッド） */
#4CAF50  /* 成功（グリーン） */

/* ダークサイドバー */
#1a1d23  /* 背景 */
```

### レイアウト原則
- **モバイルファースト**: 360px〜414pxを基準
- **タップターゲット**: 最小44px
- **スペーシング**: 4の倍数（4px, 8px, 12px, 16px...）
- **ブレークポイント**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px

---

## ⚠️ 既知の問題

### 1. ChunkLoadError
**原因**: Next.jsのビルドキャッシュ問題
**解決策**: `.next`ディレクトリを削除して再起動

### 2. ポート3000が使用中
**現象**: 開発サーバーがポート3001で起動
**対処**: 問題なし（3001で継続使用）

### 3. 認証機能の無効化
**状況**: NextAuth.jsは設定済みだが、ログインページを一時スキップ
**理由**: 開発速度優先
**今後**: 本番デプロイ前に有効化が必要

---

## 📖 参考リソース

### 内部ドキュメント
- `Claude.md` - プロジェクト全体の索引、役割別ガイド
- `plan.md` - 要件定義書（FR-01〜FR-76、非機能要件）
- `DESIGN_SYSTEM.md` - デザインシステム仕様
- `.smd/mobile-ui-optimization-progress.md` - モバイルUI作業ログ

### 外部リソース
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/docs)

---

## 🚀 次のアクションアイテム

### 即座に実施可能
1. **ZettAIロゴの追加**
   - ロゴ画像ファイルを`public/images/`に配置
   - サイドバー、予約ページヘッダー、ファビコンに適用

2. **タイポグラフィの統一**
   - `globals.css`にclamp関数ベースのレスポンシブクラス追加
   - 既存のtext-*クラスを置き換え

3. **モバイルUI検証**
   - 360-414pxでの表示テスト
   - 検証結果を`.smd/mobile-ui-verification.md`に記録

### 将来対応
1. **認証機能の有効化**
   - ログインページの復元
   - NextAuth.js設定の最終確認

2. **データベース連携**
   - Supabaseテーブルの作成
   - API実装（`/api/*`）

3. **Google Calendar API連携**
   - OAuth設定
   - Meet自動発行機能

---

## 💡 開発のヒント

### モバイル対応の基本パターン
```tsx
// ❌ 避けるべきパターン
<div className="text-4xl">タイトル</div>
<Button className="h-14 px-8">ボタン</Button>

// ✅ 推奨パターン
<div className="text-2xl sm:text-3xl md:text-4xl">タイトル</div>
<Button className="h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto">ボタン</Button>
```

### Selectドロップダウンの高さ制限
```tsx
<SelectContent className="max-h-[200px] overflow-y-auto">
  {/* ... */}
</SelectContent>
```

### レスポンシブグリッド
```tsx
// モバイル: 2列、デスクトップ: 5列
<div className="grid gap-3 sm:gap-6 grid-cols-2 md:grid-cols-5">
  {/* ... */}
</div>
```

---

## 📞 問い合わせ先

### プロジェクト関連
- **リポジトリ**: https://github.com/ZETTAI-INC/TImelex
- **組織**: ZettAI

### 技術的な質問
- `Claude.md`の「よくある質問（FAQ）」セクションを参照
- 各ドキュメントの末尾に関連リソースリンクあり

---

## ✅ 引き継ぎチェックリスト

- [x] モバイルUI最適化完了（管理画面5ページ）
- [x] プロジェクト名統一（TIMREXPLUS）
- [x] ログインページ一時無効化
- [x] デバッグ表示削除
- [x] ChunkLoadError解消
- [x] 全変更をGitHubにプッシュ
- [ ] ZettAIロゴ追加（画像ファイル待ち）
- [ ] タイポグラフィ統一（clamp関数）
- [ ] モバイルUI検証ログ作成

---

**最終更新**: 2025-11-12
**次回レビュー**: ロゴ追加完了後

**引き継ぎ準備完了 ✓**
