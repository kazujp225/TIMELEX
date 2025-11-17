"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { formatDate } from "@/lib/utils"

interface AdminStats {
  today: {
    total: number
    confirmed: number
    cancelled: number
    recent: number
    new: number
  }
  week: {
    total: number
    confirmed: number
    cancelled: number
    recent: number
    new: number
  }
  month: {
    total: number
    confirmed: number
    cancelled: number
    recent: number
    new: number
  }
  allTime: {
    totalBookings: number
    consultationTypes: number
  }
  emails: {
    totalSent: number
    sentToday: number
    failed: number
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // 認証チェック
    const authenticated = sessionStorage.getItem("admin_authenticated")
    if (authenticated === "true") {
      setIsAuthenticated(true)
      fetchStats()
    } else {
      // 未認証の場合はログインページにリダイレクト
      window.location.href = "/admin/login"
    }
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // Supabaseから実データを取得
      const { supabase } = await import("@/lib/supabase")

      // 今日の日付範囲
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      // 週の日付範囲
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)

      // 月の日付範囲
      const monthStart = new Date()
      monthStart.setDate(monthStart.getDate() - 30)

      // 今日の予約
      const { data: todayBookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("start_time", todayStart.toISOString())
        .lte("start_time", todayEnd.toISOString())

      // 週の予約
      const { data: weekBookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("start_time", weekStart.toISOString())

      // 月の予約
      const { data: monthBookings } = await supabase
        .from("bookings")
        .select("*")
        .gte("start_time", monthStart.toISOString())

      // 全予約
      const { data: allBookings } = await supabase
        .from("bookings")
        .select("*")

      // 相談種別
      const { data: consultationTypes } = await supabase
        .from("consultation_types")
        .select("*")

      // メール統計
      const { data: allEmails } = await supabase
        .from("email_logs")
        .select("*")

      const { data: todayEmails } = await supabase
        .from("email_logs")
        .select("*")
        .gte("created_at", todayStart.toISOString())
        .lte("created_at", todayEnd.toISOString())

      setStats({
        today: {
          total: todayBookings?.length || 0,
          confirmed: todayBookings?.filter((b) => b.status === "confirmed").length || 0,
          cancelled: todayBookings?.filter((b) => b.status === "cancelled").length || 0,
          recent: todayBookings?.filter((b) => b.is_recent).length || 0,
          new: todayBookings?.filter((b) => !b.is_recent).length || 0,
        },
        week: {
          total: weekBookings?.length || 0,
          confirmed: weekBookings?.filter((b) => b.status === "confirmed").length || 0,
          cancelled: weekBookings?.filter((b) => b.status === "cancelled").length || 0,
          recent: weekBookings?.filter((b) => b.is_recent).length || 0,
          new: weekBookings?.filter((b) => !b.is_recent).length || 0,
        },
        month: {
          total: monthBookings?.length || 0,
          confirmed: monthBookings?.filter((b) => b.status === "confirmed").length || 0,
          cancelled: monthBookings?.filter((b) => b.status === "cancelled").length || 0,
          recent: monthBookings?.filter((b) => b.is_recent).length || 0,
          new: monthBookings?.filter((b) => !b.is_recent).length || 0,
        },
        allTime: {
          totalBookings: allBookings?.length || 0,
          consultationTypes: consultationTypes?.length || 0,
        },
        emails: {
          totalSent: allEmails?.filter((e) => e.is_sent).length || 0,
          sentToday: todayEmails?.filter((e) => e.is_sent).length || 0,
          failed: allEmails?.filter((e) => !e.is_sent).length || 0,
        },
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="text-gray-600 mt-2">
          システム全体の状況を確認できます
        </p>
      </div>

      {/* System Overview */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">システム概要</h2>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-xs text-gray-500 mb-1">総予約数</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {stats?.allTime.totalBookings || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">全期間</div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-xs text-gray-500 mb-1">相談種別</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {stats?.allTime.consultationTypes || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">種類</div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm col-span-2 md:col-span-1">
            <div className="text-xs text-gray-500 mb-1">メール送信</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {stats?.emails.totalSent || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">
              今日: {stats?.emails.sentToday || 0}件
              {stats?.emails.failed ? ` / 失敗: ${stats.emails.failed}件` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">今日の予約</h2>
        <div className="text-sm text-gray-500 mb-4">
          {formatDate(new Date(), "YYYY/MM/DD")}
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.today.total || 0}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">総予約数</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {stats?.today.confirmed || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">確定</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-bold text-red-600">
              {stats?.today.cancelled || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">キャンセル</div>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">今週の予約</h2>
        <div className="text-sm text-gray-500 mb-4">過去7日間の統計</div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.week.total || 0}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">総予約数</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {stats?.week.confirmed || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">確定</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-bold text-red-600">
              {stats?.week.cancelled || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">キャンセル</div>
          </div>
        </div>
      </div>

      {/* Monthly Stats */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">今月の予約</h2>
        <div className="text-sm text-gray-500 mb-4">
          {formatDate(new Date(), "YYYY年MM月")}
        </div>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3">
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{stats?.month.total || 0}</div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">総予約数</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-2xl md:text-3xl font-bold text-green-600">
              {stats?.month.confirmed || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">確定</div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm col-span-2 md:col-span-1">
            <div className="text-2xl md:text-3xl font-bold text-red-600">
              {stats?.month.cancelled || 0}
            </div>
            <div className="text-xs md:text-sm text-gray-500 mt-1">キャンセル</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="hidden md:block">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">クイックアクション</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <a
            href="/admin/booking-urls"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">予約URL</h3>
            <p className="text-sm text-gray-600">
              お客様に送る予約URLを取得
            </p>
          </a>
          <a
            href="/admin/calendar"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">予約カレンダー</h3>
            <p className="text-sm text-gray-600">
              全予約を一覧で確認
            </p>
          </a>
          <a
            href="/admin/reports"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">レポート</h3>
            <p className="text-sm text-gray-600">
              予約分析・統計データ
            </p>
          </a>
          <a
            href="/admin/emails"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">送信メール</h3>
            <p className="text-sm text-gray-600">
              メール送信履歴を確認
            </p>
          </a>
          <a
            href="/admin/consultation-types"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">相談種別管理</h3>
            <p className="text-sm text-gray-600">
              相談種別の設定・編集
            </p>
          </a>
          <a
            href="/admin/settings"
            className="group p-6 border border-gray-200 rounded-lg bg-white shadow-sm hover:border-gray-400 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-lg text-gray-900 mb-1">システム設定</h3>
            <p className="text-sm text-gray-600">
              グローバル設定の変更
            </p>
          </a>
        </div>
      </div>
    </div>
  )
}
