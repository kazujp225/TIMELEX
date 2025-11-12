# SHIFT風ダークサイドバーコンポーネント

## 概要

TUMELEXPLUSプロジェクト用に作成されたSHIFTアプリ風のダークサイドバーコンポーネント。スタッフポータルと管理者ポータルの両方で使用可能な、モダンで直感的なナビゲーションUIを提供します。

## コンポーネント構成

### 1. DarkSidebar.tsx
メインのサイドバーコンポーネント

**特徴:**
- 背景色: `#1a1d23`（濃いグレー）
- テキスト: 白色とグレー
- TUMELEX ブランドロゴ（グラデーション）
- アイコン + テキストのメニュー項目
- ホバー時の背景色変更
- アクティブ項目の青いアクセント（`#6EC5FF`）
- 折りたたみ機能（デスクトップ）
- レスポンシブデザイン（モバイル時はボトムナビゲーション）

**Props:**
```typescript
interface DarkSidebarProps {
  role: "staff" | "admin"  // スタッフまたは管理者
  userEmail?: string | null // ログイン中のユーザーメール
}
```

### 2. DashboardLayout.tsx
サイドバーを含むレイアウトラッパー

**Props:**
```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  role: "staff" | "admin"
  userEmail?: string | null
}
```

## デザイン仕様

### カラーパレット

| 用途 | カラー | 説明 |
|------|--------|------|
| **サイドバー背景** | `#1a1d23` | 濃いグレー |
| **テキスト（アクティブ）** | `#ffffff` | 白 |
| **テキスト（非アクティブ）** | `#9ca3af` | グレー |
| **ホバー背景** | `#252932` | ライトグレー |
| **アクティブ背景** | `rgba(110, 197, 255, 0.1)` | 青の透過 |
| **アクティブアクセント** | `#6EC5FF` | 青 |
| **ブランドグラデーション** | `#6EC5FF → #FFC870` | 青→オレンジ |

### アイコン

Lucide Reactアイコンを使用：
- `LayoutDashboard` - ダッシュボード
- `Calendar` - カレンダー
- `ClipboardList` - 予約一覧/アンケート
- `Users` - スタッフ管理
- `Settings` - 設定
- `BarChart3` - レポート
- `MessageSquare` - 相談種別
- `FileText` - お問い合わせ元
- `LogOut` - ログアウト
- `ChevronLeft/Right` - 折りたたみ

### レスポンシブ対応

#### デスクトップ（lg以上）
- 左側固定サイドバー
- 幅: 256px（展開時）/ 80px（折りたたみ時）
- フルナビゲーション表示
- 折りたたみボタン表示

#### モバイル（lg未満）
- 下部固定ナビゲーションバー
- 高さ: 64px
- 最大4項目まで表示
- コンパクトレイアウト

## 使用方法

### スタッフポータルへの適用

`/app/staff/layout.tsx`で使用：

```tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function StaffLayout({ children }) {
  const { data: session } = useSession()

  return (
    <DashboardLayout role="staff" userEmail={session?.user?.email}>
      {children}
    </DashboardLayout>
  )
}
```

### 管理者ポータルへの適用

`/app/admin/layout.tsx`で使用：

```tsx
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function AdminLayout({ children }) {
  const { data: session } = useSession()

  return (
    <DashboardLayout role="admin" userEmail={session?.user?.email}>
      {children}
    </DashboardLayout>
  )
}
```

## ナビゲーション項目

### スタッフポータル
1. ダッシュボード (`/staff`)
2. 予約一覧 (`/staff/bookings`)
3. カレンダー (`/staff/calendar`)

### 管理者ポータル
1. ダッシュボード (`/admin`)
2. スタッフ管理 (`/admin/staff`)
3. 相談種別 (`/admin/consultation-types`)
4. お問い合わせ元 (`/admin/inquiry-sources`)
5. アンケート (`/admin/questionnaires`)
6. レポート (`/admin/reports`)
7. 設定 (`/admin/settings`)

## 機能詳細

### 1. アクティブ状態の判定

現在のURLパスと一致するメニュー項目をアクティブ表示：
```typescript
const isActive = (href: string) => {
  if (href === `/${role}`) {
    return pathname === href
  }
  return pathname?.startsWith(href)
}
```

### 2. 折りたたみ機能

デスクトップ版では、サイドバーを折りたたんでコンテンツ領域を広げることが可能：
- 展開時: アイコン + テキスト
- 折りたたみ時: アイコンのみ + ホバー時ツールチップ

### 3. ロールバッジ

ユーザーのロール（スタッフ/管理者）を視覚的に表示：
- スタッフ: 青いバッジ
- 管理者: 青いバッジ

### 4. ユーザー情報表示

サイドバー下部にログイン中のユーザーメールを表示（展開時のみ）

## アクセシビリティ

- すべてのボタンに適切な`aria-label`を設定
- キーボードナビゲーション対応
- フォーカス表示の最適化
- 最小タップ領域: 44px × 44px（モバイル）

## カスタマイズ

### ナビゲーション項目の追加

`DarkSidebar.tsx`内の配列を編集：

```typescript
const adminNavItems: NavItem[] = [
  // 既存項目...
  {
    label: "新機能",
    href: "/admin/new-feature",
    icon: IconName,
    badge: "NEW"  // オプション: バッジ表示
  },
]
```

### カラー変更

`/app/globals.css`のCSS変数を編集：

```css
:root {
  --sidebar-bg: #1a1d23;        /* サイドバー背景 */
  --sidebar-text: #ffffff;       /* テキスト色 */
  --sidebar-text-muted: #9ca3af; /* 非アクティブテキスト */
  --sidebar-hover: #252932;      /* ホバー背景 */
  --sidebar-active: #2d3340;     /* アクティブ背景 */
}
```

### 幅の調整

`DarkSidebar.tsx`のクラス名を編集：

```tsx
className={`... ${isCollapsed ? "w-20" : "w-64"}`}
// w-64 (256px) を任意の幅に変更可能
```

## トラブルシューティング

### サイドバーが表示されない

1. `lucide-react`パッケージがインストールされているか確認：
   ```bash
   npm install lucide-react
   ```

2. インポートパスが正しいか確認：
   ```tsx
   import { DashboardLayout } from "@/components/layout/DashboardLayout"
   ```

### モバイルでレイアウトが崩れる

`DashboardLayout.tsx`のメインコンテナに適切なパディングが設定されているか確認：
```tsx
<main className="lg:pl-64 pb-16 lg:pb-0">
  {/* lg:pl-64 はデスクトップでサイドバー分の左パディング */}
  {/* pb-16 はモバイルで下部ナビゲーション分のパディング */}
</main>
```

### アクティブ状態が反映されない

`usePathname()`が正しく動作しているか確認。`"use client"`ディレクティブが必要です。

## 今後の拡張予定

- [ ] ダークモード/ライトモードの切り替え
- [ ] サイドバー幅のユーザー設定保存（localStorage）
- [ ] 通知バッジ機能
- [ ] サブメニュー（ドロップダウン）対応
- [ ] 検索機能の統合

## 関連ファイル

- `/components/layout/DarkSidebar.tsx` - メインコンポーネント
- `/components/layout/DashboardLayout.tsx` - レイアウトラッパー
- `/app/staff/layout.tsx` - スタッフポータルレイアウト
- `/app/admin/layout.tsx` - 管理者ポータルレイアウト
- `/app/globals.css` - グローバルスタイル（SHIFT風デザインシステム）

## 参考リソース

- [Lucide React Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [SHIFT アプリ](https://shift-app.com/) - デザイン参考

---

**作成日**: 2025-11-12
**バージョン**: 1.0.0
**担当**: ZettAI Team
