# TIMREXPLUS デザインシステム（SHIFT風）

**バージョン**: 1.0
**最終更新**: 2025-11-12
**ベース**: SHIFTアプリのデザイン言語

---

## 概要

このデザインシステムは、SHIFTアプリのクリーンでモダンなデザイン言語をTIMREXPLUSに適用したものです。ダークサイドバー、白いメインエリア、控えめな影、統一されたスペーシングを特徴とします。

---

## カラーパレット

### サイドバー
```css
--sidebar-bg: #1a1d23           /* ダークグレー背景 */
--sidebar-text: #ffffff          /* 白いテキスト */
--sidebar-text-muted: #9ca3af    /* グレーのミュートテキスト */
--sidebar-hover: #252932         /* ホバー時の背景 */
--sidebar-active: #2d3340        /* アクティブ時の背景 */
```

### メインエリア
```css
--main-bg: #f8f9fa              /* 薄いグレー背景 */
--content-bg: #ffffff            /* 白いコンテンツ背景 */
```

### ブルー系統（プライマリー）
```css
--blue-50: #eff6ff
--blue-100: #dbeafe
--blue-200: #bfdbfe
--blue-300: #93c5fd
--blue-400: #60a5fa
--blue-500: #3b82f6   /* メインのブルー */
--blue-600: #2563eb
--blue-700: #1d4ed8
--blue-800: #1e40af
--blue-900: #1e3a8a
```

### グレースケール
```css
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-200: #e5e7eb   /* ボーダー */
--gray-300: #d1d5db
--gray-400: #9ca3af   /* プレースホルダー */
--gray-500: #6b7280   /* セカンダリテキスト */
--gray-600: #4b5563
--gray-700: #374151   /* プライマリテキスト */
--gray-800: #1f2937
--gray-900: #111827
```

### セマンティックカラー
```css
--success: #10b981   /* 緑 */
--warning: #f59e0b   /* オレンジ */
--error: #ef4444     /* 赤 */
--info: #3b82f6      /* ブルー */
```

---

## スペーシング

統一された余白システム：

```css
--spacing-xs: 8px
--spacing-sm: 12px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px
--spacing-3xl: 64px
```

**使用例:**
- カード内のパディング: `var(--spacing-lg)` (24px)
- セクション間のマージン: `var(--spacing-2xl)` (48px)
- 要素間の小さな余白: `var(--spacing-sm)` (12px)

---

## ボーダー・角丸

### ボーダーラディウス
```css
--radius-sm: 8px     /* ボタン、入力フィールド */
--radius-md: 12px    /* カード */
--radius-lg: 16px    /* コンテンツエリア */
--radius-xl: 20px    /* 大きなカード */
--radius-full: 9999px /* バッジ、ピル */
```

### ボーダー
```css
--border-width: 1px
--border-color: var(--gray-200)       /* 薄いグレー */
--border-color-dark: var(--gray-300)  /* 濃いグレー */
```

---

## シャドウ（控えめ）

SHIFTアプリの特徴である控えめな影：

```css
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)
```

**使用ガイドライン:**
- カード: `--shadow-xs` または `--shadow-sm`
- ホバー時: `--shadow-md`
- モーダル: `--shadow-xl`
- サイドバー: `--shadow-lg`

---

## タイポグラフィ

### フォントサイズ
```css
--font-size-xs: 12px    /* 小さなテキスト、バッジ */
--font-size-sm: 14px    /* セカンダリテキスト */
--font-size-base: 16px  /* ボディテキスト */
--font-size-lg: 18px    /* サブタイトル */
--font-size-xl: 20px    /* カードタイトル */
--font-size-2xl: 24px   /* セクションタイトル */
--font-size-3xl: 30px   /* ページタイトル */
--font-size-4xl: 36px   /* ヒーロータイトル */
```

### フォントウェイト
```css
--font-weight-normal: 400      /* 通常テキスト */
--font-weight-medium: 500      /* ナビゲーション、ボタン */
--font-weight-semibold: 600    /* カードタイトル、重要なテキスト */
--font-weight-bold: 700        /* ページタイトル、ヘッダー */
```

### 行間
```css
--line-height-tight: 1.25      /* ヘッダー */
--line-height-normal: 1.5      /* ボディテキスト */
--line-height-relaxed: 1.75    /* 長文テキスト */
```

---

## トランジション

滑らかなアニメーション：

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)    /* ホバー */
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)    /* 標準 */
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)    /* ページ遷移 */
```

---

## Z-Index階層

```css
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

---

## コンポーネント

### サイドバー

**クラス:**
- `.shift-sidebar` - サイドバーコンテナ
- `.shift-sidebar-item` - サイドバーアイテム
- `.shift-sidebar-item.active` - アクティブアイテム

**使用例:**
```jsx
<aside className="shift-sidebar">
  <nav>
    <a href="#" className="shift-sidebar-item active">
      ダッシュボード
    </a>
    <a href="#" className="shift-sidebar-item">
      予約一覧
    </a>
  </nav>
</aside>
```

**特徴:**
- ダークグレー背景 (#1a1d23)
- ホバー時に背景色が明るくなる
- アクティブ時にフォントウェイトがセミボールドに

---

### レイアウト

**クラス:**
- `.shift-main` - メインコンテナ（薄いグレー背景）
- `.shift-content` - コンテンツエリア（白い背景、角丸、影）

**使用例:**
```jsx
<main className="shift-main">
  <div className="shift-content">
    {/* コンテンツ */}
  </div>
</main>
```

---

### カード

**クラス:**
- `.shift-card` - カードコンテナ
- `.shift-card-title` - カードタイトル
- `.shift-card-description` - カード説明

**使用例:**
```jsx
<div className="shift-card">
  <h3 className="shift-card-title">予約詳細</h3>
  <p className="shift-card-description">
    2025年11月15日 14:00-15:00
  </p>
</div>
```

**特徴:**
- 白い背景
- 薄いグレーのボーダー
- 控えめな影 (shadow-xs)
- ホバー時に影が濃くなり、上に移動

---

### ボタン

**クラス:**
- `.shift-btn` - ベースボタン
- `.shift-btn-primary` - プライマリーボタン（ブルー）
- `.shift-btn-secondary` - セカンダリーボタン（グレー）
- `.shift-btn-outline` - アウトラインボタン

**使用例:**
```jsx
<button className="shift-btn shift-btn-primary">
  予約を確定
</button>

<button className="shift-btn shift-btn-secondary">
  キャンセル
</button>

<button className="shift-btn shift-btn-outline">
  詳細を見る
</button>
```

**特徴:**
- 角丸 (8px)
- セミボールドフォント
- ホバー時に上に移動、影が濃くなる
- アクティブ時に元の位置に戻る
- 最小高さ 44px（タップ領域確保）

---

### 入力フィールド

**クラス:**
- `.shift-input` - テキスト入力
- `.shift-input.error` - エラー状態

**使用例:**
```jsx
<input
  type="text"
  className="shift-input"
  placeholder="メールアドレスを入力"
/>

<input
  type="text"
  className="shift-input error"
  placeholder="メールアドレスを入力"
/>
```

**特徴:**
- 角丸 (8px)
- フォーカス時にブルーのボーダーと薄い影
- エラー時に赤いボーダー
- プレースホルダーはグレー
- 最小高さ 44px

---

### ラベル

**クラス:**
- `.shift-label` - フォームラベル
- `.shift-label.required` - 必須ラベル（アスタリスク表示）

**使用例:**
```jsx
<label className="shift-label required">
  メールアドレス
</label>
<input type="email" className="shift-input" />
```

---

### バッジ

**クラス:**
- `.shift-badge` - ベースバッジ
- `.shift-badge-primary` - プライマリー（ブルー）
- `.shift-badge-success` - 成功（グリーン）
- `.shift-badge-warning` - 警告（イエロー）
- `.shift-badge-error` - エラー（レッド）
- `.shift-badge-gray` - グレー

**使用例:**
```jsx
<span className="shift-badge shift-badge-success">
  確定済み
</span>

<span className="shift-badge shift-badge-warning">
  保留中
</span>

<span className="shift-badge shift-badge-error">
  キャンセル
</span>
```

**特徴:**
- 完全な角丸（ピル形状）
- 小さなフォントサイズ (12px)
- ミディアムフォントウェイト
- 色ごとに背景とテキスト色が最適化

---

### ディバイダー

**クラス:**
- `.shift-divider` - 水平線

**使用例:**
```jsx
<hr className="shift-divider" />
```

---

### セクションヘッダー

**クラス:**
- `.shift-section-header` - セクションヘッダーコンテナ
- `.shift-section-title` - セクションタイトル
- `.shift-section-subtitle` - セクションサブタイトル

**使用例:**
```jsx
<div className="shift-section-header">
  <h2 className="shift-section-title">予約一覧</h2>
  <p className="shift-section-subtitle">
    今月の予約を表示しています
  </p>
</div>
```

---

## SHIFTアプリとの比較

### 共通点
- **ダークサイドバー**: 濃いグレー (#1a1d23) を採用
- **白いメインエリア**: 薄いグレー背景 (#f8f9fa) + 白いコンテンツ
- **控えめな影**: 強すぎない shadow-xs、shadow-sm を使用
- **統一されたスペーシング**: 8px刻みのスペーシングシステム
- **角丸**: 8-16px の適度な角丸
- **ブルー系統**: プライマリーカラーとして #3b82f6 を使用
- **セミボールドフォント**: タイトルや重要なテキストに 600 を使用

### TIMREXPLUS独自の拡張
- **セマンティックカラー**: success, warning, error, info の追加
- **バッジコンポーネント**: ステータス表示用の5種類のバッジ
- **詳細なタイポグラフィスケール**: xs から 4xl まで8段階
- **アクセシビリティ強化**: 最小タップ領域 44px の確保
- **トランジション**: 統一された cubic-bezier アニメーション

---

## 次に適用すべきコンポーネント

### 優先度: 高
1. **ナビゲーションバー/サイドバー**
   - `.shift-sidebar` の適用
   - ダークグレー背景とホワイトテキスト

2. **予約カード**
   - `.shift-card` の適用
   - 予約詳細表示に最適

3. **フォーム要素**
   - `.shift-input`、`.shift-label` の適用
   - 予約フォーム、クライアント情報入力に使用

4. **ボタン**
   - `.shift-btn-primary`、`.shift-btn-secondary` の適用
   - CTA、キャンセルボタン等

### 優先度: 中
5. **ステータスバッジ**
   - `.shift-badge-*` の適用
   - 予約ステータス（確定済み、保留中、キャンセル）

6. **レイアウト**
   - `.shift-main`、`.shift-content` の適用
   - ページ全体の構造

### 優先度: 低
7. **セクションヘッダー**
   - `.shift-section-header` の適用
   - ダッシュボード、一覧ページ

---

## 実装ガイドライン

### CSS変数の使い方

**良い例:**
```css
.my-component {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  color: var(--gray-700);
}
```

**悪い例:**
```css
.my-component {
  padding: 24px;  /* ハードコーディング */
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  color: #374151;
}
```

### Tailwindとの併用

既存のTailwindクラスと併用可能：

```jsx
<div className="shift-card flex items-center gap-4">
  <button className="shift-btn shift-btn-primary w-full">
    送信
  </button>
</div>
```

### レスポンシブデザイン

メディアクエリと組み合わせて使用：

```css
.my-component {
  padding: var(--spacing-md);
}

@media (min-width: 768px) {
  .my-component {
    padding: var(--spacing-xl);
  }
}
```

---

## チェックリスト

### デザインシステム導入時のチェック項目

- [ ] `app/globals.css` が読み込まれていることを確認
- [ ] カラーパレットが正しく表示されることを確認
- [ ] ボタンのホバー、アクティブ状態が動作することを確認
- [ ] 入力フィールドのフォーカス状態が動作することを確認
- [ ] カードのホバー効果が動作することを確認
- [ ] サイドバーの背景色が #1a1d23 であることを確認
- [ ] メインエリアの背景色が #f8f9fa であることを確認
- [ ] 影が控えめであることを確認
- [ ] モバイルでのタップ領域（最小44px）を確認
- [ ] フォントウェイトがSHIFT風（セミボールド使用）であることを確認

---

## 参考リソース

- **SHIFTアプリ**: デザインの参考元
- **Tailwind CSS**: ユーティリティクラスと併用
- **plan.md**: プロジェクト要件（カラーパレット: #6EC5FF, #FFC870 も定義済み）

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|----------|------|---------|
| v1.0 | 2025-11-12 | 初版作成（SHIFT風デザインシステム構築） |

---

**最終更新**: 2025-11-12
**次回レビュー予定**: コンポーネント実装後
