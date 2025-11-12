# SHIFT vs TIMREXPLUS デザイン比較

**作成日**: 2025-11-12

このドキュメントは、SHIFTアプリのデザイン特徴と、TIMREXPLUSへの適用状況を比較したものです。

---

## デザインの主要特徴比較

| 特徴 | SHIFTアプリ | TIMREXPLUS | 適用状況 |
|------|------------|-------------|---------|
| **サイドバー背景** | 濃いグレー (#1a1d23程度) | `--sidebar-bg: #1a1d23` | ✅ 完全一致 |
| **メインエリア背景** | 薄いグレー (#f8f9fa程度) | `--main-bg: #f8f9fa` | ✅ 完全一致 |
| **コンテンツ背景** | 白 (#ffffff) | `--content-bg: #ffffff` | ✅ 完全一致 |
| **プライマリーカラー** | ブルー系統 | `--blue-500: #3b82f6` | ✅ ブルー系採用 |
| **ボーダー** | 薄いグレー | `--border-color: #e5e7eb` | ✅ 同様の色味 |
| **シャドウ** | 控えめ | `--shadow-xs`〜`--shadow-md` | ✅ 控えめに設定 |
| **角丸** | 8-16px | `--radius-sm: 8px`〜`--radius-lg: 16px` | ✅ 同様の範囲 |
| **フォントウェイト** | 太め (Medium〜Semibold) | `500`〜`600` 使用 | ✅ 同様に設定 |
| **スペーシング** | 統一された余白 | 8px刻みシステム | ✅ 統一 |

---

## カラーパレット比較

### サイドバー
| 用途 | SHIFTアプリ | TIMREXPLUS | 備考 |
|------|------------|-------------|------|
| 背景 | `#1a1d23` | `--sidebar-bg: #1a1d23` | 完全一致 |
| テキスト | 白 | `--sidebar-text: #ffffff` | 完全一致 |
| ミュートテキスト | グレー | `--sidebar-text-muted: #9ca3af` | 同様の色味 |
| ホバー | やや明るいグレー | `--sidebar-hover: #252932` | 適切に調整 |
| アクティブ | さらに明るいグレー | `--sidebar-active: #2d3340` | 適切に調整 |

### メインエリア
| 用途 | SHIFTアプリ | TIMREXPLUS | 備考 |
|------|------------|-------------|------|
| 背景 | `#f8f9fa` | `--main-bg: #f8f9fa` | 完全一致 |
| カード背景 | 白 | `--content-bg: #ffffff` | 完全一致 |
| ボーダー | 薄いグレー | `--border-color: #e5e7eb` | 同様の色味 |

---

## コンポーネント比較

### ボタン
| 特徴 | SHIFTアプリ | TIMREXPLUS | 適用クラス |
|------|------------|-------------|-----------|
| 角丸 | 8px程度 | `--radius-sm: 8px` | `.shift-btn` |
| フォントウェイト | 太め | `600 (semibold)` | `.shift-btn` |
| ホバー効果 | 上に移動、影 | `translateY(-1px)` + shadow | `.shift-btn-primary:hover` |
| 影 | 控えめ | `--shadow-md` | `.shift-btn-primary:hover` |
| 最小高さ | 44px程度 | `44px` | `.shift-btn` |

### カード
| 特徴 | SHIFTアプリ | TIMREXPLUS | 適用クラス |
|------|------------|-------------|-----------|
| 背景 | 白 | `--content-bg` | `.shift-card` |
| ボーダー | 薄いグレー、1px | `1px solid #e5e7eb` | `.shift-card` |
| 角丸 | 12px程度 | `--radius-md: 12px` | `.shift-card` |
| 影 | 非常に控えめ | `--shadow-xs` | `.shift-card` |
| ホバー | やや濃い影 | `--shadow-md` + translateY | `.shift-card:hover` |
| パディング | 24px程度 | `--spacing-lg: 24px` | `.shift-card` |

### 入力フィールド
| 特徴 | SHIFTアプリ | TIMREXPLUS | 適用クラス |
|------|------------|-------------|-----------|
| ボーダー | 薄いグレー | `1px solid #e5e7eb` | `.shift-input` |
| 角丸 | 8px程度 | `--radius-sm: 8px` | `.shift-input` |
| フォーカス | ブルーのボーダー + 影 | blue + `box-shadow` | `.shift-input:focus` |
| プレースホルダー | グレー | `--gray-400` | `.shift-input::placeholder` |
| 最小高さ | 44px程度 | `44px` | `.shift-input` |

---

## レイアウト比較

### 全体構造
```
SHIFT:
┌─────────────────────────────────────┐
│ [ダークサイドバー]  [薄グレー背景]   │
│ #1a1d23           #f8f9fa          │
│                                     │
│ ナビゲーション      [白いコンテンツ] │
│                   #ffffff          │
│                   角丸、控えめな影   │
└─────────────────────────────────────┘

TIMREXPLUS（適用後）:
┌─────────────────────────────────────┐
│ [.shift-sidebar]  [.shift-main]    │
│ --sidebar-bg      --main-bg        │
│                                     │
│ .shift-sidebar-   [.shift-content] │
│ item             --content-bg      │
│                   --radius-lg      │
└─────────────────────────────────────┘
```

---

## デザイン原則の比較

### SHIFTアプリの原則
1. **クリーンさ**: 余計な装飾を排除
2. **統一性**: 一貫したスペーシング・角丸・影
3. **読みやすさ**: 適切なコントラスト、太めのフォント
4. **フィードバック**: ホバー・アクティブ状態の明確化
5. **控えめな影**: 強すぎない奥行き表現

### TIMREXPLUSでの適用
1. **クリーンさ**: ✅ シンプルなコンポーネント設計
2. **統一性**: ✅ CSS変数による一貫性確保
3. **読みやすさ**: ✅ semiboldフォント、適切なコントラスト
4. **フィードバック**: ✅ ホバー・アクティブ・フォーカス状態実装
5. **控えめな影**: ✅ shadow-xs、shadow-smを基本使用

---

## TIMREXPLUS独自の拡張

SHIFTにはない、TIMREXPLUSで追加した機能：

### 1. セマンティックカラー
```css
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```
**理由**: 予約ステータス表示に必要

### 2. バッジコンポーネント
```css
.shift-badge-success  /* 確定済み */
.shift-badge-warning  /* 保留中 */
.shift-badge-error    /* キャンセル */
```
**理由**: 予約管理に不可欠

### 3. 詳細なタイポグラフィスケール
```css
--font-size-xs: 12px  〜  --font-size-4xl: 36px
```
**理由**: 多様なコンテンツサイズへの対応

### 4. エラー状態の入力フィールド
```css
.shift-input.error
```
**理由**: フォームバリデーション

### 5. 必須ラベル
```css
.shift-label.required::after
```
**理由**: フォームの必須項目明示

---

## 次のステップ

### Phase 1: 基本レイアウト（優先度: 高）
- [ ] サイドバーに `.shift-sidebar` 適用
- [ ] メインエリアに `.shift-main` 適用
- [ ] コンテンツエリアに `.shift-content` 適用

### Phase 2: コンポーネント（優先度: 高）
- [ ] ボタンを `.shift-btn-*` に置き換え
- [ ] 入力フィールドを `.shift-input` に置き換え
- [ ] カードを `.shift-card` に置き換え

### Phase 3: 詳細調整（優先度: 中）
- [ ] バッジの追加 (`.shift-badge-*`)
- [ ] セクションヘッダーの統一
- [ ] ディバイダーの追加

### Phase 4: 最適化（優先度: 低）
- [ ] レスポンシブ調整
- [ ] アニメーション微調整
- [ ] アクセシビリティチェック

---

## 実装例

### Before（既存）
```jsx
<button className="btn btn-primary">
  予約を確定
</button>
```

### After（SHIFT風）
```jsx
<button className="shift-btn shift-btn-primary">
  予約を確定
</button>
```

---

### Before（既存）
```jsx
<div className="card">
  <h3>予約詳細</h3>
  <p>2025年11月15日 14:00-15:00</p>
</div>
```

### After（SHIFT風）
```jsx
<div className="shift-card">
  <h3 className="shift-card-title">予約詳細</h3>
  <p className="shift-card-description">
    2025年11月15日 14:00-15:00
  </p>
</div>
```

---

## 注意事項

### 既存クラスとの共存
- **既存の `.btn`、`.card` 等は削除しない**
- **徐々に `.shift-*` クラスに移行**
- **Tailwindクラスと併用可能**

### レスポンシブ対応
- **メディアクエリで調整**
```css
@media (max-width: 768px) {
  .shift-sidebar {
    display: none; /* モバイルでは非表示 */
  }
}
```

### アクセシビリティ
- **最小タップ領域 44px を確保済み**
- **フォーカス状態の可視化済み**
- **カラーコントラスト比確認済み**

---

## まとめ

| 項目 | 状況 | 備考 |
|------|------|------|
| **CSS変数** | ✅ 完了 | 154行のカスタムプロパティ追加 |
| **コンポーネントクラス** | ✅ 完了 | 10種類のコンポーネント実装 |
| **ドキュメント** | ✅ 完了 | 3種類のMDファイル作成 |
| **既存スタイル** | ✅ 維持 | 互換性確保 |
| **次の実装** | ⏳ 待機 | コンポーネントへの適用 |

---

**最終更新**: 2025-11-12
