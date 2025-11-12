"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, getWeekday } from "@/lib/utils"
import type { BookingWithRelations } from "@/types"

export default function StaffCalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"week" | "month">("week")

  useEffect(() => {
    loadMockBookings()
  }, [currentDate])

  const loadMockBookings = () => {
    setLoading(true)

    // モックデータ
    const mockData: BookingWithRelations[] = []
    const weekStart = new Date(currentDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())

    // 今週の予約をランダムに生成
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)

      // 平日は予約を追加
      if (i >= 1 && i <= 5) {
        const morningBooking: BookingWithRelations = {
          id: `booking-${i}-1`,
          status: "confirmed" as any,
          start_time: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 0),
          end_time: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 10, 30),
          duration_minutes: 30,
          staff_id: "staff-1",
          consultation_type_id: "type-1",
          inquiry_source_id: "source-1",
          client_name: `山田${i}太郎`,
          client_email: `client${i}@example.com`,
          client_company: `株式会社${i}`,
          client_memo: null,
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
        }
        mockData.push(morningBooking)

        if (i === 2 || i === 4) {
          const afternoonBooking: BookingWithRelations = {
            ...morningBooking,
            id: `booking-${i}-2`,
            start_time: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 14, 0),
            end_time: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 15, 0),
            duration_minutes: 60,
            client_name: `佐藤${i}花子`,
            consultation_type: {
              ...morningBooking.consultation_type,
              id: "type-2",
              name: "フォローアップ",
              duration_minutes: 60,
            },
          }
          mockData.push(afternoonBooking)
        }
      }
    }

    setBookings(mockData)
    setLoading(false)
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getWeekDays = () => {
    const days = []
    const start = new Date(currentDate)
    start.setDate(start.getDate() - start.getDay()) // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(day.getDate() + i)
      days.push(day)
    }

    return days
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.start_time)
      return (
        bookingDate.getFullYear() === date.getFullYear() &&
        bookingDate.getMonth() === date.getMonth() &&
        bookingDate.getDate() === date.getDate()
      )
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  }

  const weekDays = getWeekDays()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-6 md:p-8 border border-primary/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📅</div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">カレンダー</h1>
              <p className="text-muted-foreground mt-1">
                {formatDate(weekDays[0], "YYYY/MM/DD")} 〜{" "}
                {formatDate(weekDays[6], "MM/DD")}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={goToPreviousWeek}
              className="h-10 px-4 rounded-xl hover:bg-accent"
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              前週
            </Button>
            <Button
              variant="default"
              onClick={goToToday}
              className="h-10 px-6 rounded-xl shadow-sm"
            >
              今日
            </Button>
            <Button
              variant="outline"
              onClick={goToNextWeek}
              className="h-10 px-4 rounded-xl hover:bg-accent"
            >
              次週
              <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="grid gap-4 md:grid-cols-7">
        {weekDays.map((day, index) => {
          const dayBookings = getBookingsForDate(day)
          const today = isToday(day)
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))

          return (
            <Card
              key={index}
              className={`transition-all hover:shadow-md ${
                today
                  ? "border-primary border-2 shadow-lg shadow-primary/10"
                  : "border-border/50"
              } ${isPast ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-center">
                  <div className={`text-xs font-medium mb-1 ${today ? "text-primary" : "text-muted-foreground"}`}>
                    {getWeekday(day)}
                  </div>
                  <div className={`flex items-center justify-center ${today ? "h-12 w-12 mx-auto rounded-full bg-primary text-white text-2xl font-bold" : "text-3xl font-semibold text-foreground"}`}>
                    {day.getDate()}
                  </div>
                  {today && (
                    <div className="text-xs text-primary mt-2 font-semibold">今日</div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {dayBookings.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    <svg className="h-8 w-8 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    予定なし
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-3 rounded-lg text-sm border transition-all hover:shadow-sm ${
                          booking.status === "confirmed"
                            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                            : booking.status === "cancelled"
                            ? "bg-destructive/5 border-destructive/20 line-through"
                            : "bg-muted border-border"
                        }`}
                      >
                        <div className={`font-semibold mb-1 ${booking.status === "confirmed" ? "text-primary" : "text-foreground"}`}>
                          {formatDate(booking.start_time, "HH:mm")}
                        </div>
                        <div className="text-xs font-medium truncate text-foreground">
                          {booking.client_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {booking.consultation_type.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h2 className="text-lg font-semibold">今週の統計</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {bookings.filter((b) => b.status === "confirmed").length}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">確定済み</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="h-7 w-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {bookings.filter((b) => b.is_recent).length}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">継続顧客</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">
                {bookings.filter((b) => !b.is_recent).length}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">新規顧客</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
