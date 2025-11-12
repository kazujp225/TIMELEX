"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Users,
  Settings,
  BarChart3,
  MessageSquare,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const staffNavItems: NavItem[] = [
    { label: "ダッシュボード", href: "/staff", icon: LayoutDashboard },
    { label: "予約一覧", href: "/staff/bookings", icon: ClipboardList },
    { label: "カレンダー", href: "/staff/calendar", icon: Calendar },
  ]

  const adminNavItems: NavItem[] = [
    { label: "ダッシュボード", href: "/admin", icon: LayoutDashboard },
    { label: "スタッフ管理", href: "/admin/staff", icon: Users },
    { label: "相談種別", href: "/admin/consultation-types", icon: MessageSquare },
    { label: "お問い合わせ元", href: "/admin/inquiry-sources", icon: FileText },
    { label: "アンケート", href: "/admin/questionnaires", icon: ClipboardList },
    { label: "レポート", href: "/admin/reports", icon: BarChart3 },
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
      <aside
        className={`hidden lg:flex flex-col bg-[#1a1d23] text-white h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700/50">
          <Link href={`/${role}`} className="flex items-center gap-2">
            {!isCollapsed && (
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#6EC5FF] to-[#FFC870] bg-clip-text text-transparent">
                TUMELEX
              </h1>
            )}
            {isCollapsed && (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6EC5FF] to-[#FFC870] flex items-center justify-center font-bold text-sm">
                T
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-md hover:bg-gray-700/50 transition-colors"
            aria-label={isCollapsed ? "サイドバーを展開" : "サイドバーを折りたたむ"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Role Badge */}
        {!isCollapsed && (
          <div className="px-6 py-3 border-b border-gray-700/50">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6EC5FF]/10 border border-[#6EC5FF]/20">
              <div className="w-2 h-2 rounded-full bg-[#6EC5FF]" />
              <span className="text-xs font-medium text-[#6EC5FF]">
                {role === "admin" ? "管理者" : "スタッフ"}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    active
                      ? "bg-[#6EC5FF]/10 text-[#6EC5FF]"
                      : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#6EC5FF] rounded-r-full" />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? "mx-auto" : ""}`} />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-[#FFC870] text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45" />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-700/50 p-4">
          {!isCollapsed && userEmail && (
            <div className="mb-3 px-3 py-2 bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">ログイン中</p>
              <p className="text-sm text-white truncate">{userEmail}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: `/${role}/login` })}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 w-full ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">ログアウト</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1d23] border-t border-gray-700/50">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px] ${
                  active
                    ? "text-[#6EC5FF]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#6EC5FF] rounded-t-full" />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
