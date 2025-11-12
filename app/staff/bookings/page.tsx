"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, getWeekday } from "@/lib/utils"
import type { BookingWithRelations, BookingStatus } from "@/types"
import Link from "next/link"

export default function BookingsListPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")

  useEffect(() => {
    loadMockBookings()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bookings, searchQuery, statusFilter, dateFilter])

  const loadMockBookings = () => {
    setLoading(true)

    // モックデータ
    const now = new Date()
    const mockBookings: BookingWithRelations[] = []

    // 今日の予約
    for (let i = 0; i < 3; i++) {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10 + i * 2, 0)
      const endTime = new Date(startTime.getTime() + 30 * 60000)

      mockBookings.push({
        id: `today-${i}`,
        status: i === 0 ? "confirmed" as any : i === 1 ? "completed" as any : "confirmed" as any,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: 30,
        staff_id: "staff-1",
        consultation_type_id: "type-1",
        inquiry_source_id: "source-1",
        client_name: `${["山田太郎", "佐藤花子", "鈴木一郎"][i]}`,
        client_email: `client${i}@example.com`,
        client_company: `株式会社${["A", "B", "C"][i]}`,
        client_memo: i === 0 ? "初回相談希望" : null,
        is_recent: i % 2 === 0,
        google_event_id: `event-${i}`,
        google_meet_link: "https://meet.google.com/xxx-yyyy-zzz",
        cancel_token: `token-${i}`,
        created_at: new Date(),
        updated_at: new Date(),
        staff: {
          id: "staff-1",
          name: "スタッフA",
          email: "staff@example.com",
          is_active: true,
          timezone: "Asia/Tokyo",
          created_at: new Date(),
          updated_at: new Date(),
        },
        consultation_type: {
          id: "type-1",
          name: i === 0 ? "初回相談" : i === 1 ? "フォローアップ" : "技術相談",
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
          name: i === 0 ? "自社サイト" : i === 1 ? "紹介" : "広告",
          display_order: 0,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
    }

    // 明日以降の予約
    for (let day = 1; day <= 5; day++) {
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, 14, 0)
      const endTime = new Date(startTime.getTime() + 60 * 60000)

      mockBookings.push({
        id: `future-${day}`,
        status: day === 3 ? "cancelled" as any : "confirmed" as any,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: 60,
        staff_id: "staff-1",
        consultation_type_id: "type-2",
        inquiry_source_id: "source-2",
        client_name: `田中${day}郎`,
        client_email: `future${day}@example.com`,
        client_company: day % 2 === 0 ? `企業${day}` : null,
        client_memo: null,
        is_recent: day % 2 === 1,
        google_event_id: `event-future-${day}`,
        google_meet_link: "https://meet.google.com/xxx-yyyy-zzz",
        cancel_token: `token-future-${day}`,
        created_at: new Date(),
        updated_at: new Date(),
        staff: {
          id: "staff-1",
          name: "スタッフA",
          email: "staff@example.com",
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
          id: "source-2",
          name: "メール営業",
          display_order: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
    }

    setBookings(mockBookings)
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...bookings]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.client_name.toLowerCase().includes(query) ||
          b.client_email.toLowerCase().includes(query) ||
          b.client_company?.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    // Date filter
    const now = new Date()
    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.start_time)
        return bookingDate >= today && bookingDate < tomorrow
      })
    } else if (dateFilter === "week") {
      const weekFromNow = new Date(now)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      filtered = filtered.filter((b) => new Date(b.start_time) <= weekFromNow)
    } else if (dateFilter === "month") {
      filtered = filtered.filter((b) => {
        const bookingDate = new Date(b.start_time)
        return (
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear()
        )
      })
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    setFilteredBookings(filtered)
  }

  const groupBookingsByDate = () => {
    const groups: { [key: string]: BookingWithRelations[] } = {}

    filteredBookings.forEach((booking) => {
      const dateKey = formatDate(booking.start_time, "YYYY/MM/DD")
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(booking)
    })

    return groups
  }

  const getStatusBadge = (status: BookingStatus) => {
    const styles = {
      confirmed: "bg-success/10 text-success",
      cancelled: "bg-destructive/10 text-destructive",
      completed: "bg-muted text-muted-foreground",
      no_show: "bg-destructive/20 text-destructive",
    }

    const labels = {
      confirmed: "確定",
      cancelled: "キャンセル",
      completed: "完了",
      no_show: "No-show",
    }

    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 ">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-10 border-2 border-primary/10">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-5xl">📋</div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">予約一覧</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              全ての予約を確認・管理できます
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-8 border-2 border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-semibold">絞り込み</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              検索
            </label>
            <Input
              placeholder="名前、メール、会社名"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              ステータス
            </label>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as BookingStatus | "all")}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="confirmed">確定</SelectItem>
                <SelectItem value="cancelled">キャンセル</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
                <SelectItem value="no_show">No-show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              期間
            </label>
            <Select
              value={dateFilter}
              onValueChange={(value) => setDateFilter(value as any)}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全期間</SelectItem>
                <SelectItem value="today">今日</SelectItem>
                <SelectItem value="week">今週</SelectItem>
                <SelectItem value="month">今月</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">予約一覧</h2>
          <div className="text-sm text-muted-foreground">
            全{filteredBookings.length}件
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <svg
                  className="mx-auto h-16 w-16 mb-4 text-muted-foreground/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium mb-1">予約がありません</p>
                <p className="text-sm">条件を変更して再度検索してください</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {Object.entries(groupBookingsByDate()).map(([dateKey, dayBookings]) => {
              const firstBooking = dayBookings[0]
              const isToday =
                formatDate(new Date(), "YYYY/MM/DD") === dateKey
              const isPast =
                new Date(firstBooking.start_time) < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                    <div
                      className={`text-sm font-semibold px-3 py-1 rounded-full ${
                        isToday
                          ? "bg-primary text-white"
                          : isPast
                          ? "bg-muted text-muted-foreground"
                          : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {dateKey}（{getWeekday(firstBooking.start_time)}）
                      {isToday && " - 今日"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dayBookings.length}件
                    </div>
                  </div>

                  <div className="space-y-3">
                    {dayBookings.map((booking) => {
                      const isUpcoming =
                        booking.status === "confirmed" &&
                        new Date(booking.start_time) > new Date()

                      return (
                        <Card
                          key={booking.id}
                          className={`transition-all hover:shadow-md ${
                            isUpcoming ? "border-l-4 border-l-primary" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                              <div className="flex-1 space-y-3">
                                {/* Header: Time and Status */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-lg font-semibold text-foreground">
                                    {formatDate(booking.start_time, "HH:mm")} -{" "}
                                    {formatDate(booking.end_time, "HH:mm")}
                                  </span>
                                  {getStatusBadge(booking.status)}
                                  <span
                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                      booking.is_recent
                                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                                        : "bg-green-50 text-green-700 border border-green-200"
                                    }`}
                                  >
                                    {booking.is_recent ? "🔄 継続" : "✨ 新規"}
                                  </span>
                                </div>

                                {/* Client Info */}
                                <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="h-4 w-4 text-muted-foreground"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span className="font-medium">
                                      {booking.client_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="h-4 w-4 text-muted-foreground"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span className="text-muted-foreground text-xs">
                                      {booking.client_email}
                                    </span>
                                  </div>
                                  {booking.client_company && (
                                    <div className="flex items-center gap-2">
                                      <svg
                                        className="h-4 w-4 text-muted-foreground"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                        />
                                      </svg>
                                      <span className="text-muted-foreground">
                                        {booking.client_company}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="h-4 w-4 text-muted-foreground"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                                      />
                                    </svg>
                                    <span className="text-muted-foreground">
                                      {booking.consultation_type.name}
                                    </span>
                                  </div>
                                </div>

                                {/* Memo */}
                                {booking.client_memo && (
                                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                                    <div className="flex gap-2">
                                      <svg
                                        className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      <p className="text-sm text-amber-900">
                                        {booking.client_memo}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Source tag */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <svg
                                    className="h-3 w-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                    />
                                  </svg>
                                  {booking.inquiry_source.name}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex lg:flex-col gap-2 lg:min-w-[120px]">
                                {isUpcoming && (
                                  <a
                                    href={booking.google_meet_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                  >
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                      />
                                    </svg>
                                    Meet参加
                                  </a>
                                )}
                                <Link
                                  href={`/staff/bookings/${booking.id}`}
                                  className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
                                >
                                  <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  詳細
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
