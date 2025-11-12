# TIMREXPLUS デザイントークン クイックリファレンス

**バージョン**: 1.0
**最終更新**: 2025-11-12

このファイルは、開発時にすぐに参照できるデザイントークン（CSS変数）の一覧です。

---

## カラートークン

### サイドバー
| トークン | 値 | 用途 |
|---------|-----|------|
| `--sidebar-bg` | `#1a1d23` | サイドバー背景 |
| `--sidebar-text` | `#ffffff` | サイドバーテキスト |
| `--sidebar-text-muted` | `#9ca3af` | サイドバーグレーテキスト |
| `--sidebar-hover` | `#252932` | ホバー時背景 |
| `--sidebar-active` | `#2d3340` | アクティブ時背景 |

### レイアウト
| トークン | 値 | 用途 |
|---------|-----|------|
| `--main-bg` | `#f8f9fa` | メインエリア背景 |
| `--content-bg` | `#ffffff` | コンテンツ背景 |

### ブルー（プライマリー）
| トークン | 値 | 用途 |
|---------|-----|------|
| `--blue-50` | `#eff6ff` | 極薄いブルー |
| `--blue-100` | `#dbeafe` | 薄いブルー |
| `--blue-500` | `#3b82f6` | **メインブルー** |
| `--blue-600` | `#2563eb` | ホバー時 |
| `--blue-700` | `#1d4ed8` | 濃いブルー |

### グレースケール
| トークン | 値 | 用途 |
|---------|-----|------|
| `--gray-50` | `#f9fafb` | 極薄いグレー |
| `--gray-100` | `#f3f4f6` | 薄いグレー背景 |
| `--gray-200` | `#e5e7eb` | ボーダー |
| `--gray-400` | `#9ca3af` | プレースホルダー |
| `--gray-500` | `#6b7280` | セカンダリテキスト |
| `--gray-700` | `#374151` | プライマリテキスト |
| `--gray-900` | `#111827` | 濃いテキスト |

### セマンティック
| トークン | 値 | 用途 |
|---------|-----|------|
| `--success` | `#10b981` | 成功 |
| `--warning` | `#f59e0b` | 警告 |
| `--error` | `#ef4444` | エラー |
| `--info` | `#3b82f6` | 情報 |

---

## スペーシングトークン

| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--spacing-xs` | `8px` | アイコンとテキスト間 |
| `--spacing-sm` | `12px` | ラベルと入力フィールド間 |
| `--spacing-md` | `16px` | フォーム要素間 |
| `--spacing-lg` | `24px` | カードパディング、セクション間 |
| `--spacing-xl` | `32px` | 大きなセクション間 |
| `--spacing-2xl` | `48px` | ページセクション間 |
| `--spacing-3xl` | `64px` | ヒーローセクション |

---

## ボーダートークン

### ラディウス
| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--radius-sm` | `8px` | ボタン、入力 |
| `--radius-md` | `12px` | カード |
| `--radius-lg` | `16px` | コンテンツエリア |
| `--radius-xl` | `20px` | 大きなカード |
| `--radius-full` | `9999px` | バッジ、ピル |

### ボーダー
| トークン | 値 | 用途 |
|---------|-----|------|
| `--border-width` | `1px` | 標準ボーダー |
| `--border-color` | `var(--gray-200)` | 薄いボーダー |
| `--border-color-dark` | `var(--gray-300)` | 濃いボーダー |

---

## シャドウトークン

| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--shadow-xs` | `0 1px 2px 0 rgba(0,0,0,0.05)` | カード、バッジ |
| `--shadow-sm` | `0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)` | コンテンツエリア |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` | ホバー時 |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` | サイドバー |
| `--shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` | モーダル |

---

## タイポグラフィトークン

### フォントサイズ
| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--font-size-xs` | `12px` | バッジ、小さなテキスト |
| `--font-size-sm` | `14px` | ラベル、説明文 |
| `--font-size-base` | `16px` | ボディテキスト |
| `--font-size-lg` | `18px` | サブタイトル |
| `--font-size-xl` | `20px` | カードタイトル |
| `--font-size-2xl` | `24px` | セクションタイトル |
| `--font-size-3xl` | `30px` | ページタイトル |
| `--font-size-4xl` | `36px` | ヒーロータイトル |

### フォントウェイト
| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--font-weight-normal` | `400` | ボディテキスト |
| `--font-weight-medium` | `500` | ナビゲーション、ボタン |
| `--font-weight-semibold` | `600` | カードタイトル、重要テキスト |
| `--font-weight-bold` | `700` | ページタイトル、ヘッダー |

### 行間
| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--line-height-tight` | `1.25` | ヘッダー、タイトル |
| `--line-height-normal` | `1.5` | ボディテキスト |
| `--line-height-relaxed` | `1.75` | 長文テキスト |

---

## トランジショントークン

| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--transition-fast` | `150ms cubic-bezier(0.4,0,0.2,1)` | ホバー効果 |
| `--transition-base` | `200ms cubic-bezier(0.4,0,0.2,1)` | 標準アニメーション |
| `--transition-slow` | `300ms cubic-bezier(0.4,0,0.2,1)` | ページ遷移 |

---

## Z-Indexトークン

| トークン | 値 | 使用例 |
|---------|-----|--------|
| `--z-dropdown` | `1000` | ドロップダウンメニュー |
| `--z-sticky` | `1020` | スティッキーヘッダー |
| `--z-fixed` | `1030` | 固定サイドバー |
| `--z-modal-backdrop` | `1040` | モーダル背景 |
| `--z-modal` | `1050` | モーダル |
| `--z-popover` | `1060` | ポップオーバー |
| `--z-tooltip` | `1070` | ツールチップ |

---

## よく使うコンポーネントクラス

### サイドバー
```css
.shift-sidebar          /* サイドバーコンテナ */
.shift-sidebar-item     /* サイドバーアイテム */
.shift-sidebar-item.active  /* アクティブアイテム */
```

### レイアウト
```css
.shift-main             /* メインコンテナ */
.shift-content          /* コンテンツエリア */
```

### カード
```css
.shift-card             /* カードコンテナ */
.shift-card-title       /* カードタイトル */
.shift-card-description /* カード説明 */
```

### ボタン
```css
.shift-btn              /* ベースボタン */
.shift-btn-primary      /* プライマリーボタン */
.shift-btn-secondary    /* セカンダリーボタン */
.shift-btn-outline      /* アウトラインボタン */
```

### 入力
```css
.shift-input            /* 入力フィールド */
.shift-input.error      /* エラー状態 */
.shift-label            /* ラベル */
.shift-label.required   /* 必須ラベル */
```

### バッジ
```css
.shift-badge            /* ベースバッジ */
.shift-badge-primary    /* ブルー */
.shift-badge-success    /* グリーン */
.shift-badge-warning    /* イエロー */
.shift-badge-error      /* レッド */
.shift-badge-gray       /* グレー */
```

### その他
```css
.shift-divider          /* 水平線 */
.shift-section-header   /* セクションヘッダー */
.shift-section-title    /* セクションタイトル */
.shift-section-subtitle /* セクションサブタイトル */
```

---

## コピー&ペースト用コードスニペット

### カード
```jsx
<div className="shift-card">
  <h3 className="shift-card-title">タイトル</h3>
  <p className="shift-card-description">説明文</p>
</div>
```

### ボタン
```jsx
<button className="shift-btn shift-btn-primary">
  プライマリー
</button>
```

### フォーム
```jsx
<div>
  <label className="shift-label required">
    メールアドレス
  </label>
  <input
    type="email"
    className="shift-input"
    placeholder="example@email.com"
  />
</div>
```

### バッジ
```jsx
<span className="shift-badge shift-badge-success">
  確定済み
</span>
```

### セクションヘッダー
```jsx
<div className="shift-section-header">
  <h2 className="shift-section-title">予約一覧</h2>
  <p className="shift-section-subtitle">
    今月の予約を表示しています
  </p>
</div>
```

---

## 開発時のヒント

### CSS変数の使い方
```css
/* 良い例 */
.my-element {
  padding: var(--spacing-lg);
  color: var(--gray-700);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

/* 悪い例（ハードコーディング） */
.my-element {
  padding: 24px;
  color: #374151;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

### Tailwindとの併用
```jsx
<div className="shift-card flex items-center gap-4">
  {/* Tailwindのユーティリティクラスと併用可能 */}
</div>
```

### ダイナミックスタイル（React）
```jsx
<div
  style={{
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--content-bg)'
  }}
>
  コンテンツ
</div>
```

---

**最終更新**: 2025-11-12
