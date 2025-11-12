# SHIFT風デザイン クイックスタートガイド

**最終更新**: 2025-11-12

このガイドは、SHIFT風デザインシステムを今すぐ使い始めるための最短手順をまとめたものです。

---

## 5分で始める

### Step 1: CSS変数が読み込まれているか確認

`app/globals.css` が自動的にインポートされているはずです。確認方法：

```tsx
// app/layout.tsx または pages/_app.tsx
import './globals.css'  // ← これがあればOK
```

### Step 2: 最初のコンポーネントを作る

#### 例1: SHIFT風ボタン
```tsx
<button className="shift-btn shift-btn-primary">
  予約を確定
</button>
```

#### 例2: SHIFT風カード
```tsx
<div className="shift-card">
  <h3 className="shift-card-title">予約詳細</h3>
  <p className="shift-card-description">
    2025年11月15日 14:00-15:00
  </p>
</div>
```

#### 例3: SHIFT風フォーム
```tsx
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

### Step 3: 完成！

ブラウザで確認すると、SHIFT風のクリーンなデザインになっているはずです。

---

## よく使うパターン

### パターン1: サイドバー付きレイアウト
```tsx
<div className="flex">
  {/* サイドバー */}
  <aside className="shift-sidebar w-64">
    <nav className="p-4">
      <a href="#" className="shift-sidebar-item active">
        ダッシュボード
      </a>
      <a href="#" className="shift-sidebar-item">
        予約一覧
      </a>
      <a href="#" className="shift-sidebar-item">
        設定
      </a>
    </nav>
  </aside>

  {/* メインコンテンツ */}
  <main className="shift-main flex-1 p-8">
    <div className="shift-content">
      <h1>ダッシュボード</h1>
      {/* コンテンツ */}
    </div>
  </main>
</div>
```

### パターン2: カードグリッド
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div className="shift-card">
    <h3 className="shift-card-title">今日の予約</h3>
    <p className="text-4xl font-bold my-4">12</p>
    <span className="shift-badge shift-badge-primary">
      +3 from yesterday
    </span>
  </div>

  <div className="shift-card">
    <h3 className="shift-card-title">今週の予約</h3>
    <p className="text-4xl font-bold my-4">48</p>
    <span className="shift-badge shift-badge-success">
      On track
    </span>
  </div>

  <div className="shift-card">
    <h3 className="shift-card-title">キャンセル率</h3>
    <p className="text-4xl font-bold my-4">2.3%</p>
    <span className="shift-badge shift-badge-gray">
      Normal
    </span>
  </div>
</div>
```

### パターン3: フォーム
```tsx
<div className="shift-content max-w-2xl">
  <div className="shift-section-header">
    <h2 className="shift-section-title">予約フォーム</h2>
    <p className="shift-section-subtitle">
      必要な情報を入力してください
    </p>
  </div>

  <form className="space-y-6">
    {/* 名前 */}
    <div>
      <label className="shift-label required">お名前</label>
      <input
        type="text"
        className="shift-input"
        placeholder="山田太郎"
      />
    </div>

    {/* メール */}
    <div>
      <label className="shift-label required">メールアドレス</label>
      <input
        type="email"
        className="shift-input"
        placeholder="example@email.com"
      />
    </div>

    {/* 送信ボタン */}
    <div className="flex gap-4">
      <button type="submit" className="shift-btn shift-btn-primary">
        予約を確定
      </button>
      <button type="button" className="shift-btn shift-btn-secondary">
        キャンセル
      </button>
    </div>
  </form>
</div>
```

### パターン4: ステータスバッジ
```tsx
<div className="flex gap-2">
  <span className="shift-badge shift-badge-success">
    確定済み
  </span>
  <span className="shift-badge shift-badge-warning">
    保留中
  </span>
  <span className="shift-badge shift-badge-error">
    キャンセル
  </span>
  <span className="shift-badge shift-badge-gray">
    完了
  </span>
</div>
```

---

## CSS変数を直接使う

コンポーネントクラスを使わず、CSS変数を直接使うこともできます：

### インラインスタイル（React）
```tsx
<div
  style={{
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: 'var(--content-bg)',
    boxShadow: 'var(--shadow-sm)'
  }}
>
  カスタムコンテンツ
</div>
```

### Tailwind + CSS変数
```tsx
<div className="p-6 rounded-xl bg-white" style={{ boxShadow: 'var(--shadow-md)' }}>
  Tailwindと併用
</div>
```

### カスタムCSS
```css
.my-custom-component {
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
  background-color: var(--content-bg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.my-custom-component:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

---

## カラーパレット（コピペ用）

### サイドバー
```css
background-color: var(--sidebar-bg);        /* #1a1d23 */
color: var(--sidebar-text);                 /* #ffffff */
color: var(--sidebar-text-muted);           /* #9ca3af */
```

### ブルー
```css
background-color: var(--blue-500);          /* #3b82f6 */
background-color: var(--blue-600);          /* #2563eb (hover) */
```

### グレー
```css
color: var(--gray-500);                     /* #6b7280 (secondary text) */
color: var(--gray-700);                     /* #374151 (primary text) */
border-color: var(--border-color);          /* #e5e7eb */
```

### セマンティック
```css
color: var(--success);                      /* #10b981 */
color: var(--warning);                      /* #f59e0b */
color: var(--error);                        /* #ef4444 */
color: var(--info);                         /* #3b82f6 */
```

---

## スペーシング（コピペ用）

```css
padding: var(--spacing-xs);     /* 8px */
padding: var(--spacing-sm);     /* 12px */
padding: var(--spacing-md);     /* 16px */
padding: var(--spacing-lg);     /* 24px */
padding: var(--spacing-xl);     /* 32px */
padding: var(--spacing-2xl);    /* 48px */
```

---

## トラブルシューティング

### Q: スタイルが適用されない
**A**: 以下を確認してください：
1. `app/globals.css` が正しくインポートされているか
2. クラス名のスペルミスがないか（`shift-btn` not `shift-button`）
3. ブラウザのキャッシュをクリア

### Q: 既存のスタイルと衝突する
**A**: SHIFT風クラスは既存の `.btn`、`.card` と共存できます。徐々に移行してください。

### Q: Tailwindクラスと併用したい
**A**: 可能です！
```tsx
<button className="shift-btn shift-btn-primary w-full mt-4">
  送信
</button>
```

### Q: CSS変数が効かない
**A**: `:root` スコープで定義されているため、どこからでも使えます。`var(--変数名)` で参照してください。

---

## チートシート

### ボタン
| クラス | 見た目 |
|--------|--------|
| `shift-btn shift-btn-primary` | ブルー、白文字 |
| `shift-btn shift-btn-secondary` | グレー、黒文字 |
| `shift-btn shift-btn-outline` | 透明、ボーダー |

### バッジ
| クラス | 色 |
|--------|-----|
| `shift-badge shift-badge-primary` | ブルー |
| `shift-badge shift-badge-success` | グリーン |
| `shift-badge shift-badge-warning` | イエロー |
| `shift-badge shift-badge-error` | レッド |
| `shift-badge shift-badge-gray` | グレー |

### 影
| CSS変数 | 用途 |
|---------|------|
| `var(--shadow-xs)` | カード |
| `var(--shadow-sm)` | コンテンツエリア |
| `var(--shadow-md)` | ホバー時 |
| `var(--shadow-lg)` | サイドバー |
| `var(--shadow-xl)` | モーダル |

---

## 完全な例（ダッシュボード）

```tsx
export default function Dashboard() {
  return (
    <div className="flex h-screen">
      {/* サイドバー */}
      <aside className="shift-sidebar w-64">
        <div className="p-6">
          <h1 className="text-xl font-bold mb-8">TUMELEXPLUS</h1>
          <nav className="space-y-2">
            <a href="#" className="shift-sidebar-item active">
              ダッシュボード
            </a>
            <a href="#" className="shift-sidebar-item">
              予約一覧
            </a>
            <a href="#" className="shift-sidebar-item">
              クライアント
            </a>
            <a href="#" className="shift-sidebar-item">
              設定
            </a>
          </nav>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="shift-main flex-1 overflow-auto">
        <div className="p-8">
          {/* ヘッダー */}
          <div className="shift-section-header">
            <h2 className="shift-section-title">ダッシュボード</h2>
            <p className="shift-section-subtitle">
              今日の予約状況を確認できます
            </p>
          </div>

          {/* カードグリッド */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="shift-card">
              <h3 className="shift-card-title">今日の予約</h3>
              <p className="text-4xl font-bold my-4">12</p>
              <span className="shift-badge shift-badge-primary">
                +3 from yesterday
              </span>
            </div>

            <div className="shift-card">
              <h3 className="shift-card-title">今週の予約</h3>
              <p className="text-4xl font-bold my-4">48</p>
              <span className="shift-badge shift-badge-success">
                On track
              </span>
            </div>

            <div className="shift-card">
              <h3 className="shift-card-title">キャンセル率</h3>
              <p className="text-4xl font-bold my-4">2.3%</p>
              <span className="shift-badge shift-badge-gray">
                Normal
              </span>
            </div>
          </div>

          {/* 予約リスト */}
          <div className="shift-content">
            <h3 className="text-xl font-semibold mb-4">直近の予約</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b">
                  <div>
                    <p className="font-semibold">山田太郎</p>
                    <p className="text-sm text-gray-500">
                      2025年11月15日 14:00-15:00
                    </p>
                  </div>
                  <span className="shift-badge shift-badge-success">
                    確定済み
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 次のステップ

1. **既存コンポーネントの置き換え**: `.btn` → `.shift-btn` に徐々に移行
2. **新規コンポーネント作成**: SHIFT風クラスを使って新しい画面を作成
3. **詳細ドキュメント参照**: `DESIGN_SYSTEM.md` で全機能を確認

---

**最終更新**: 2025-11-12
**詳細情報**: `DESIGN_SYSTEM.md`、`DESIGN_TOKENS.md`、`SHIFT_COMPARISON.md` を参照
