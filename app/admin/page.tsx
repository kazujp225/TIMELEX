"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-4xl font-bold">管理者ダッシュボード</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          システム全体の状況を確認できます
        </p>
      </div>

      {/* System Overview */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardDescription className="text-base">総予約数</CardDescription>
            <CardTitle className="text-4xl">
              {stats?.allTime.totalBookings || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">全期間</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardDescription className="text-base">相談種別</CardDescription>
            <CardTitle className="text-4xl">
              {stats?.allTime.consultationTypes || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">種類</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary">
          <CardHeader className="pb-4">
            <CardDescription className="text-base">継続率</CardDescription>
            <CardTitle className="text-4xl text-primary">
              {stats?.month.total
                ? Math.round(
                    (stats.month.recent / stats.month.total) * 100
                  )
                : 0}
              %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">今月</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#6EC5FF]">
          <CardHeader className="pb-4">
            <CardDescription className="text-base">メール送信</CardDescription>
            <CardTitle className="text-4xl text-[#6EC5FF]">
              {stats?.emails.totalSent || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              今日: {stats?.emails.sentToday || 0}件
              {stats?.emails.failed ? ` / 失敗: ${stats.emails.failed}件` : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Stats */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">今日の予約</CardTitle>
          <CardDescription className="text-base">
            {formatDate(new Date(), "YYYY/MM/DD")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">{stats?.today.total || 0}</div>
              <div className="text-base text-muted-foreground mt-2">総予約数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">
                {stats?.today.confirmed || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">確定</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {stats?.today.new || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">新規</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats?.today.recent || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">継続</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">今週の予約</CardTitle>
          <CardDescription className="text-base">過去7日間の統計</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">{stats?.week.total || 0}</div>
              <div className="text-base text-muted-foreground mt-2">総予約数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">
                {stats?.week.confirmed || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">確定</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {stats?.week.new || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">新規</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats?.week.recent || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">継続</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">今月の予約</CardTitle>
          <CardDescription className="text-base">
            {formatDate(new Date(), "YYYY年MM月")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div>
              <div className="text-3xl font-bold">{stats?.month.total || 0}</div>
              <div className="text-base text-muted-foreground mt-2">総予約数</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-success">
                {stats?.month.confirmed || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">確定</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">
                {stats?.month.new || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">新規</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">
                {stats?.month.recent || 0}
              </div>
              <div className="text-base text-muted-foreground mt-2">継続</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">クイックアクション</CardTitle>
          <CardDescription className="text-base">よく使う管理機能へのショートカット</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/admin/booking-urls"
              className="p-6 border-2 border-brand-600 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">📧 予約URL</h3>
              <p className="text-base text-muted-foreground">
                お客様に送る予約URLを取得
              </p>
            </a>
            <a
              href="/admin/calendar"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">📅 予約カレンダー</h3>
              <p className="text-base text-muted-foreground">
                全予約を一覧で確認
              </p>
            </a>
            <a
              href="/admin/reports"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">📊 レポート</h3>
              <p className="text-base text-muted-foreground">
                予約分析・統計データ
              </p>
            </a>
            <a
              href="/admin/emails"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">✉️ 送信メール</h3>
              <p className="text-base text-muted-foreground">
                メール送信履歴を確認
              </p>
            </a>
            <a
              href="/admin/consultation-types"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">💬 相談種別管理</h3>
              <p className="text-base text-muted-foreground">
                相談種別の設定・編集
              </p>
            </a>
            <a
              href="/admin/settings"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">⚙️ システム設定</h3>
              <p className="text-base text-muted-foreground">
                グローバル設定の変更
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
