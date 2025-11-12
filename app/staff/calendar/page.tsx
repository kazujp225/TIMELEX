"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { BookingWithRelations } from "@/types"

export default function StaffCalendarPage() {
  const { data: session } = useSession()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null)

  useEffect(() => {
    loadMockBookings()
  }, [currentDate])

  const loadMockBookings = () => {
    setLoading(true)

    // モックデータ - シンプルに固定の予約を生成
    const mockData: BookingWithRelations[] = []
    const today = new Date()

    // 月曜日 10:00 - 初回相談
    const booking1: BookingWithRelations = {
      id: `booking-1`,
      status: "confirmed" as any,
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1, 10, 0),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1, 10, 30),
      duration_minutes: 30,
      staff_id: "staff-1",
      consultation_type_id: "type-1",
      inquiry_source_id: "source-1",
      client_name: "山田太郎",
      client_email: "yamada@example.com",
      client_company: "株式会社サンプル",
      client_memo: null,
      is_recent: false,
      google_event_id: "event-1",
      google_meet_link: "https://meet.google.com/xxx-yyyy-zzz",
      cancel_token: "token-1",
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
        google_meet_url: "https://meet.google.com/abc-defg-hij",
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
    mockData.push(booking1)

    // 火曜日 14:00 - フォローアップ
    const booking2: BookingWithRelations = {
      ...booking1,
      id: "booking-2",
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 2, 14, 0),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 2, 15, 0),
      duration_minutes: 60,
      client_name: "佐藤花子",
      client_email: "sato@example.com",
      client_company: "株式会社テスト",
      google_meet_link: "https://meet.google.com/aaa-bbbb-ccc",
      consultation_type: {
        ...booking1.consultation_type,
        id: "type-2",
        name: "フォローアップ",
        duration_minutes: 60,
        google_meet_url: "https://meet.google.com/xyz-uvwx-yzw",
      },
    }
    mockData.push(booking2)

    // 水曜日 11:00 - 初回相談
    const booking3: BookingWithRelations = {
      ...booking1,
      id: "booking-3",
      start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 3, 11, 0),
      end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 3, 11, 30),
      client_name: "鈴木一郎",
      client_email: "suzuki@example.com",
      client_company: "鈴木商事",
      google_meet_link: "https://meet.google.com/ddd-eeee-fff",
    }
    mockData.push(booking3)

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
    start.setDate(start.getDate() - start.getDay())

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
  const hours = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-[1800px]">
      {/* ヘッダー */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">マイカレンダー</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {formatDate(weekDays[0], "YYYY年MM月DD日")} 〜 {formatDate(weekDays[6], "MM月DD日")}
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={goToPreviousWeek}
            className="h-12 px-6"
          >
            ← 前週
          </Button>
          <Button
            variant="default"
            onClick={goToToday}
            className="h-12 px-8 font-semibold"
          >
            今日
          </Button>
          <Button
            variant="outline"
            onClick={goToNextWeek}
            className="h-12 px-6"
          >
            次週 →
          </Button>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <Card className="border overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* ヘッダー: 日付 */}
            <div className="grid grid-cols-[60px_repeat(7,minmax(140px,1fr))] border-b sticky top-0 bg-white z-10">
              <div className="border-r p-4"></div>
              {weekDays.map((day, index) => {
                const today = isToday(day)
                const dayName = ["日", "月", "火", "水", "木", "金", "土"][day.getDay()]
                return (
                  <div
                    key={index}
                    className={`p-4 text-center border-r ${today ? "bg-blue-50" : ""}`}
                  >
                    <div className={`text-sm font-medium ${
                      index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-500"
                    }`}>
                      {dayName}
                    </div>
                    <div className={`text-2xl font-semibold mt-1 ${
                      today ? "w-10 h-10 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center" : ""
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* タイムグリッド */}
            <div className="relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="grid grid-cols-[60px_repeat(7,minmax(140px,1fr))] border-b h-[60px]"
                >
                  {/* 時間表示 */}
                  <div className="border-r p-2 text-xs text-gray-500 text-right pr-3">
                    {hour}:00
                  </div>

                  {/* 各日のセル */}
                  {weekDays.map((day, dayIndex) => {
                    const today = isToday(day)
                    return (
                      <div
                        key={dayIndex}
                        className={`border-r relative ${today ? "bg-blue-50/30" : ""}`}
                      >
                        {/* 予定を表示 */}
                        {getBookingsForDate(day)
                          .filter((booking) => {
                            const bookingHour = new Date(booking.start_time).getHours()
                            return bookingHour === hour
                          })
                          .map((booking) => {
                            const startMinute = new Date(booking.start_time).getMinutes()
                            const duration = booking.duration_minutes
                            const top = (startMinute / 60) * 60
                            const height = (duration / 60) * 60

                            return (
                              <div
                                key={booking.id}
                                className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 hover:z-10 transition-all duration-200 ease-in-out bg-blue-500 text-white"
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                }}
                              >
                                <div
                                  className="font-semibold truncate cursor-pointer"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  {formatDate(booking.start_time, "HH:mm")} {booking.client_name}
                                </div>
                                <div
                                  className="text-[10px] opacity-90 truncate mt-0.5 cursor-pointer"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  {booking.consultation_type.name}
                                </div>
                                {(booking.consultation_type.google_meet_url || booking.google_meet_link) && (
                                  <div
                                    className="mt-1 pt-1 border-t border-white/20"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <a
                                      href={booking.consultation_type.google_meet_url || booking.google_meet_link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] underline hover:text-yellow-200 hover:scale-105 hover:font-semibold block truncate transition-all duration-200 ease-in-out hover:bg-white/10 hover:px-1 rounded"
                                      title={booking.consultation_type.google_meet_url || booking.google_meet_link}
                                    >
                                      🎥 Meet: {(booking.consultation_type.google_meet_url || booking.google_meet_link).replace('https://meet.google.com/', '')}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 統計情報 */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">今週の予約</div>
            <div className="text-4xl font-bold text-primary">{bookings.length}</div>
            <div className="text-sm text-muted-foreground mt-1">件</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">確定済み</div>
            <div className="text-4xl font-bold text-green-500">
              {bookings.filter((b) => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">件</div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground mb-2">継続顧客</div>
            <div className="text-4xl font-bold text-blue-500">
              {bookings.filter((b) => b.is_recent).length}
            </div>
            <div className="text-sm text-muted-foreground mt-1">件</div>
          </CardContent>
        </Card>
      </div>

      {/* 予約詳細モーダル */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <Card
            className="w-full max-w-md bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">予約詳細</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* 日時 */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">日時</div>
                  <div className="text-lg font-semibold">
                    {formatDate(selectedBooking.start_time, "YYYY年MM月DD日(ddd)")}
                  </div>
                  <div className="text-lg font-semibold">
                    {formatDate(selectedBooking.start_time, "HH:mm")} 〜{" "}
                    {formatDate(selectedBooking.end_time, "HH:mm")}
                  </div>
                </div>

                {/* クライアント情報 */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">クライアント</div>
                  <div className="text-lg font-semibold">{selectedBooking.client_name}</div>
                  {selectedBooking.client_company && (
                    <div className="text-sm text-gray-600">{selectedBooking.client_company}</div>
                  )}
                </div>

                {/* 相談種別 */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">相談種別</div>
                  <div className="text-lg">{selectedBooking.consultation_type.name}</div>
                </div>

                {/* Google Meet URL */}
                {(selectedBooking.consultation_type.google_meet_url || selectedBooking.google_meet_link) && (
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Google Meet</div>
                    <Button
                      onClick={() => {
                        const meetUrl = selectedBooking.consultation_type.google_meet_url || selectedBooking.google_meet_link
                        window.open(meetUrl, "_blank", "noopener,noreferrer")
                      }}
                      className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                    >
                      🎥 Google Meetに参加
                    </Button>
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs break-all text-gray-600">
                      {selectedBooking.consultation_type.google_meet_url || selectedBooking.google_meet_link}
                    </div>
                  </div>
                )}

                {/* メモ */}
                {selectedBooking.client_memo && (
                  <div>
                    <div className="text-sm text-gray-500 mb-1">メモ</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedBooking.client_memo}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  onClick={() => {
                    window.location.href = `/staff/bookings/${selectedBooking.id}`
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  詳細を見る
                </Button>
                <Button
                  onClick={() => setSelectedBooking(null)}
                  variant="default"
                  className="flex-1"
                >
                  閉じる
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
