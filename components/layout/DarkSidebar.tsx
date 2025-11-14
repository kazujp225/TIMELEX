"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Settings,
  MessageSquare,
  FileText,
  LogOut,
  Mail
} from "lucide-react"
import { signOut } from "next-auth/react"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

interface DarkSidebarProps {
  role: "staff" | "admin"
  userEmail?: string | null
}

export function DarkSidebar({ role, userEmail }: DarkSidebarProps) {
  const pathname = usePathname()

  const staffNavItems: NavItem[] = [
    { label: "ダッシュボード", href: "/staff", icon: LayoutDashboard },
    { label: "予約一覧", href: "/staff/bookings", icon: ClipboardList },
    { label: "カレンダー", href: "/staff/calendar", icon: Calendar },
  ]

  const adminNavItems: NavItem[] = [
    { label: "ダッシュボード", href: "/admin", icon: LayoutDashboard },
    { label: "予約URL", href: "/admin/booking-urls", icon: FileText },
    { label: "カレンダー", href: "/admin/calendar", icon: Calendar },
    { label: "相談種別", href: "/admin/consultation-types", icon: MessageSquare },
    { label: "送信メール", href: "/admin/emails", icon: Mail },
    { label: "設定", href: "/admin/settings", icon: Settings },
  ]

  const navItems = role === "admin" ? adminNavItems : staffNavItems

  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col bg-white border-r border-gray-200 h-screen fixed left-0 top-0 z-40 w-64">
        {/* Logo Area */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <Link href={`/${role}`}>
            <h1 className="text-lg font-semibold text-gray-900">
              TIMREXPLUS
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    active
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-200 p-4">
          {userEmail && (
            <div className="mb-3 px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">ログイン中</p>
              <p className="text-sm text-gray-900 truncate">{userEmail}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: `/${role}/login` })}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">ログアウト</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-md transition-colors flex-1 ${
                  active
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label.split(" ")[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
