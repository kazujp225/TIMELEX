"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getWeekday } from "@/lib/utils"
import type { BookingWithRelations } from "@/types"
import Link from "next/link"

export default function StaffDashboard() {
  const { data: session } = useSession()
  const [todayBookings, setTodayBookings] = useState<BookingWithRelations[]>([])
  const [upcomingBookings, setUpcomingBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 開発モード: モックデータを表示
    loadMockData()
  }, [])

  const loadMockData = () => {
    setLoading(true)

    // モックデータ
    const now = new Date()
    const mockBookings: BookingWithRelations[] = [
      {
        id: "1",
        status: "confirmed" as any,
        start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
        duration_minutes: 30,
        staff_id: "staff-1",
        consultation_type_id: "type-1",
        inquiry_source_id: "source-1",
        client_name: "山田 太郎",
        client_email: "yamada@example.com",
        client_company: "株式会社サンプル",
        client_memo: null,
        is_recent: false,
        google_event_id: "event-1",
        google_meet_link: "https://meet.google.com/abc-defg-hij",
        cancel_token: "token-1",
        created_at: new Date(),
        updated_at: new Date(),
        staff: {
          id: "staff-1",
          name: "スタッフA",
          email: "staff-a@example.com",
          is_active: true,
          timezone: "Asia/Tokyo",
          created_at: new Date(),
          updated_at: new Date(),
        },
        consultation_type: {
          id: "type-1",
          name: "初回相談",
          duration_minutes: 30,
          buffer_before_minutes: 5,
          buffer_after_minutes: 5,
          mode: "immediate" as any,
          recent_mode_override: "keep" as any,
          display_order: 0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        inquiry_source: {
          id: "source-1",
          name: "自社サイト",
          display_order: 0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
      {
        id: "2",
        status: "confirmed" as any,
        start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0),
        duration_minutes: 60,
        staff_id: "staff-1",
        consultation_type_id: "type-2",
        inquiry_source_id: "source-1",
        client_name: "佐藤 花子",
        client_email: "sato@example.com",
        client_company: "株式会社テスト",
        client_memo: null,
        is_recent: true,
        google_event_id: "event-2",
        google_meet_link: "https://meet.google.com/xyz-uvwx-yz",
        cancel_token: "token-2",
        created_at: new Date(),
        updated_at: new Date(),
        staff: {
          id: "staff-1",
          name: "スタッフA",
          email: "staff-a@example.com",
          is_active: true,
          timezone: "Asia/Tokyo",
          created_at: new Date(),
          updated_at: new Date(),
        },
        consultation_type: {
          id: "type-2",
          name: "フォローアップ",
          duration_minutes: 60,
          buffer_before_minutes: 5,
          buffer_after_minutes: 5,
          mode: "immediate" as any,
          recent_mode_override: "keep" as any,
          display_order: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        inquiry_source: {
          id: "source-1",
          name: "自社サイト",
          display_order: 0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      },
    ]

    setTodayBookings(mockBookings)

    // 今週・今月用のモックデータも設定
    const upcomingMock = [...mockBookings].map((b, i) => ({
      ...b,
      id: `upcoming-${i}`,
      start_time: new Date(now.getTime() + (i + 2) * 24 * 60 * 60 * 1000),
      end_time: new Date(now.getTime() + (i + 2) * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
    }))

    setUpcomingBookings(upcomingMock)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "おはようございます"
    if (hour < 18) return "こんにちは"
    return "こんばんは"
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl">👋</div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {getTimeOfDay()}
            </h1>
            <p className="text-muted-foreground mt-1">
              {session?.user?.name || session?.user?.email || "ゲスト"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">今日の予約</CardDescription>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {todayBookings.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(), "YYYY/MM/DD")}（{getWeekday(new Date())}）
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-500/5 to-transparent hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">今週の予約</CardDescription>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              {upcomingBookings.filter((b) => {
                const weekFromNow = new Date()
                weekFromNow.setDate(weekFromNow.getDate() + 7)
                return new Date(b.start_time) <= weekFromNow
              }).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(), "MM/DD")} 〜{" "}
              {formatDate(
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                "MM/DD"
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-500/5 to-transparent hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium">今月の予約</CardDescription>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <svg className="h-5 w-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <CardTitle className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
              {upcomingBookings.filter((b) => {
                const bookingDate = new Date(b.start_time)
                const now = new Date()
                return (
                  bookingDate.getMonth() === now.getMonth() &&
                  bookingDate.getFullYear() === now.getFullYear()
                )
              }).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(), "YYYY年MM月")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📅</span>
            本日の予定
          </h2>
          <Link
            href="/staff/calendar"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            カレンダーで見る
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {todayBookings.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-transparent">
            <CardContent className="pt-6">
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-foreground mb-1">予定なし</p>
                <p className="text-sm">今日の予約はありません。ゆっくりお過ごしください。</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border-l-4 border-l-primary hover:shadow-md transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-foreground">
                            {formatDate(booking.start_time, "HH:mm")} -{" "}
                            {formatDate(booking.end_time, "HH:mm")}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {booking.duration_minutes}分
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                booking.is_recent
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {booking.is_recent ? "継続" : "新規"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-15 space-y-1">
                        <p className="font-medium text-foreground">
                          {booking.client_name} 様
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.consultation_type.name}
                        </p>
                        {booking.client_company && (
                          <p className="text-xs text-muted-foreground">
                            {booking.client_company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex lg:flex-col gap-2">
                      <a
                        href={booking.google_meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-sm hover:shadow-md"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Meet参加
                      </a>
                      <Link
                        href={`/staff/bookings/${booking.id}`}
                        className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-xl hover:bg-accent transition-all text-sm"
                      >
                        詳細
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📆</span>
            今後の予約
          </h2>
          <Link
            href="/staff/bookings"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            すべて見る
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {upcomingBookings.filter((b) => {
          const bookingDate = new Date(b.start_time)
          const tomorrow = new Date()
          tomorrow.setDate(tomorrow.getDate() + 1)
          tomorrow.setHours(0, 0, 0, 0)
          return bookingDate >= tomorrow
        }).length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-transparent">
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <p>今後の予約はありません</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {upcomingBookings
              .filter((b) => {
                const bookingDate = new Date(b.start_time)
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                tomorrow.setHours(0, 0, 0, 0)
                return bookingDate >= tomorrow
              })
              .slice(0, 4)
              .map((booking) => (
                <Card
                  key={booking.id}
                  className="hover:shadow-md transition-all border-l-2 border-l-primary/30"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground mb-1">
                          {formatDate(booking.start_time, "MM/DD")}（
                          {getWeekday(booking.start_time)}）
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {formatDate(booking.start_time, "HH:mm")} - {booking.duration_minutes}分
                        </div>
                        <p className="text-sm font-medium text-foreground truncate">
                          {booking.client_name} 様
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.consultation_type.name}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                          booking.is_recent
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {booking.is_recent ? "継続" : "新規"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
