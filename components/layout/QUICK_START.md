# SHIFT風ダークサイドバー - クイックスタートガイド

## 5分で始める

このガイドでは、SHIFT風ダークサイドバーの基本的な使い方を5分で理解できます。

---

## 1. 既に適用済みです

SHIFT風ダークサイドバーは、以下のポータルに自動的に適用されています：

- ✅ スタッフポータル (`/staff`)
- ✅ 管理者ポータル (`/admin`)

**何もする必要はありません。** すぐに使い始められます。

---

## 2. 動作確認

### 開発サーバーを起動

```bash
npm run dev
```

### ブラウザで確認

**スタッフポータル**:
```
http://localhost:3000/staff
```

**管理者ポータル**:
```
http://localhost:3000/admin
```

---

## 3. 主な機能

### デスクトップ版

#### サイドバーの折りたたみ
- ロゴ横の「⟨」ボタンをクリック
- 展開時: アイコン + テキスト（256px幅）
- 折りたたみ時: アイコンのみ（80px幅）

#### ナビゲーション
- クリックでページ遷移
- ホバーで背景が明るくなる
- アクティブページは青くハイライト

#### ユーザー情報
- サイドバー下部にメールアドレス表示
- ログアウトボタン

### モバイル版（1024px未満）

- 下部固定ナビゲーションバー
- アイコン + 短縮ラベル
- 最大4項目表示
- アクティブ項目に青い下線

---

## 4. ナビゲーション項目

### スタッフポータル

| アイコン | ラベル | URL |
|---------|--------|-----|
| 📊 | ダッシュボード | `/staff` |
| 📋 | 予約一覧 | `/staff/bookings` |
| 📅 | カレンダー | `/staff/calendar` |

### 管理者ポータル

| アイコン | ラベル | URL |
|---------|--------|-----|
| 📊 | ダッシュボード | `/admin` |
| 👥 | スタッフ管理 | `/admin/staff` |
| 💬 | 相談種別 | `/admin/consultation-types` |
| 📄 | お問い合わせ元 | `/admin/inquiry-sources` |
| 📋 | アンケート | `/admin/questionnaires` |
| 📈 | レポート | `/admin/reports` |
| ⚙️ | 設定 | `/admin/settings` |

---

## 5. カスタマイズ（基本）

### ナビゲーション項目の追加

`/components/layout/DarkSidebar.tsx`を開いて編集：

```typescript
// スタッフポータルの場合
const staffNavItems: NavItem[] = [
  { label: "ダッシュボード", href: "/staff", icon: LayoutDashboard },
  { label: "予約一覧", href: "/staff/bookings", icon: ClipboardList },
  { label: "カレンダー", href: "/staff/calendar", icon: Calendar },
  // ↓ 新しい項目を追加
  { label: "新機能", href: "/staff/new-feature", icon: Star },
]
```

### カラーの変更

`/app/globals.css`を開いて編集：

```css
:root {
  --sidebar-bg: #1a1d23;        /* サイドバー背景色 */
  --sidebar-text: #ffffff;       /* テキスト色 */
  --sidebar-hover: #252932;      /* ホバー時の背景色 */
}
```

---

## 6. よくある質問

### Q: サイドバーを常に展開状態にできますか？

A: はい。`DarkSidebar.tsx`の初期状態を変更：

```typescript
const [isCollapsed, setIsCollapsed] = useState(false) // falseに設定
```

### Q: モバイルでサイドバー（左側）を表示できますか？

A: デフォルトでは下部ナビゲーションですが、レスポンシブブレークポイントを変更可能：

```tsx
// lg: を md: に変更
className="hidden md:flex flex-col bg-[#1a1d23]"
```

### Q: アイコンを変更したいです

A: `lucide-react`から別のアイコンをインポート：

```typescript
import { Star, Heart, Bell } from "lucide-react"

const staffNavItems: NavItem[] = [
  { label: "お気に入り", href: "/staff/favorites", icon: Star },
]
```

### Q: ログアウトボタンを上部に移動できますか？

A: `DarkSidebar.tsx`のJSXを編集して、ログアウトボタンの位置を変更してください。

---

## 7. トラブルシューティング

### サイドバーが表示されない

**確認事項**:
1. `lucide-react`がインストールされているか
   ```bash
   npm install lucide-react
   ```
2. 開発サーバーが起動しているか
   ```bash
   npm run dev
   ```

### アクティブ状態が反映されない

**確認事項**:
- ブラウザのキャッシュをクリア（Ctrl+F5 / Cmd+Shift+R）
- URLが正しいか確認

### モバイルで表示が崩れる

**確認事項**:
- ブラウザの幅を調整（1024px未満でモバイル版に切り替わる）
- devツールのレスポンシブモードで確認

---

## 8. さらに詳しく知りたい方へ

### 完全なドキュメント

- **README.md**: 完全な実装ガイドとAPI仕様
- **VISUAL_GUIDE.md**: 視覚的な仕様とデザインガイド
- **SIDEBAR_IMPLEMENTATION_REPORT.md**: 実装の詳細レポート

### プロジェクトドキュメント

- **/CLAUDE.md**: プロジェクト全体のドキュメント
- **/plan.md**: 要件定義書

---

## 9. サポート

問題が解決しない場合は、以下を確認してください：

1. TypeScriptエラーがないか:
   ```bash
   npx tsc --noEmit
   ```

2. ESLintエラーがないか:
   ```bash
   npm run lint
   ```

3. 依存関係がインストールされているか:
   ```bash
   npm install
   ```

---

## 10. 次のステップ

- [ ] 動作確認（デスクトップ・モバイル）
- [ ] カラーやナビゲーションのカスタマイズ
- [ ] 詳細ドキュメントの確認
- [ ] 本番環境へのデプロイ

---

**所要時間**: 約5分
**難易度**: ⭐️ 初級
**最終更新**: 2025-11-12

---

### すぐに使える！

サイドバーは既に適用済みです。開発サーバーを起動して、ブラウザで確認するだけです。

```bash
npm run dev
# http://localhost:3000/staff または /admin にアクセス
```

---

**Happy Coding!** 🚀
