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
    totalStaff: number
    activeStaff: number
    consultationTypes: number
    inquirySources: number
  }
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)

      // モックデータ（開発用）
      setStats({
        today: {
          total: 5,
          confirmed: 4,
          cancelled: 1,
          recent: 2,
          new: 3,
        },
        week: {
          total: 23,
          confirmed: 20,
          cancelled: 3,
          recent: 8,
          new: 15,
        },
        month: {
          total: 87,
          confirmed: 78,
          cancelled: 9,
          recent: 35,
          new: 52,
        },
        allTime: {
          totalBookings: 342,
          totalStaff: 5,
          activeStaff: 4,
          consultationTypes: 8,
          inquirySources: 6,
        },
      })
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
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
      <div className="grid gap-6 md:grid-cols-5">
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

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardDescription className="text-base">お問い合わせ元</CardDescription>
            <CardTitle className="text-4xl">
              {stats?.allTime.inquirySources || 0}
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
              href="/admin/staff"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">スタッフ管理</h3>
              <p className="text-base text-muted-foreground">
                スタッフの追加・編集・削除
              </p>
            </a>
            <a
              href="/admin/consultation-types"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">相談種別管理</h3>
              <p className="text-base text-muted-foreground">
                相談種別の設定・編集
              </p>
            </a>
            <a
              href="/admin/settings"
              className="p-6 border-2 rounded-lg hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold text-lg mb-2">システム設定</h3>
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
