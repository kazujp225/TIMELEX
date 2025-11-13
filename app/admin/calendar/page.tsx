"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import type { BookingWithRelations, Staff } from "@/types"

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [staff, setStaff] = useState<Staff[]>([])
  const [bookings, setBookings] = useState<BookingWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null)

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    setLoading(true)

    try {
      // Supabaseから実データを取得
      const { supabase } = await import("@/lib/supabase")

      // 週の開始日と終了日を計算
      const weekStart = new Date(currentDate)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      weekEnd.setHours(23, 59, 59, 999)

      // Googleカレンダー風のカラーパレット
      const colors = [
        "#4285f4", // 青
        "#ea4335", // 赤
        "#fbbc04", // 黄色
        "#34a853", // 緑
        "#ff6d01", // オレンジ
        "#46bdc6", // シアン
        "#7986cb", // 藤色
        "#f439a0", // ピンク
        "#e67c73", // サーモン
        "#33b679", // ミント
        "#8e24aa", // 紫
        "#039be5", // 水色
      ]

      // スタッフを取得
      const { data: staffData, error: staffError } = await supabase
        .from("staff")
        .select("*")
        .eq("is_active", true)
        .order("name")

      if (staffError) {
        console.error("Failed to fetch staff:", staffError)
        setStaff([])
      } else {
        // スタッフデータを型変換
        const staffList: Staff[] = (staffData || []).map((s) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          photo_url: s.photo_url,
          is_active: s.is_active,
          google_refresh_token: s.google_refresh_token,
          google_token_expires_at: s.google_token_expires_at ? new Date(s.google_token_expires_at) : null,
          timezone: s.timezone,
          created_at: new Date(s.created_at),
          updated_at: new Date(s.updated_at),
        }))
        setStaff(staffList)

        // 予約を取得（週の範囲内）
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*, staff(*), consultation_type:consultation_types(*)")
          .gte("start_time", weekStart.toISOString())
          .lte("start_time", weekEnd.toISOString())
          .order("start_time")

        if (bookingsError) {
          console.error("Failed to fetch bookings:", bookingsError)
          setBookings([])
        } else {
          // 予約データを型変換し、スタッフごとに色を割り当て
          const bookingsList: BookingWithRelations[] = (bookingsData || []).map((b) => {
            const staffIndex = staffList.findIndex((s) => s.id === b.staff_id)
            const booking: BookingWithRelations = {
              id: b.id,
              status: b.status,
              start_time: new Date(b.start_time),
              end_time: new Date(b.end_time),
              duration_minutes: b.duration_minutes,
              staff_id: b.staff_id,
              consultation_type_id: b.consultation_type_id,
              inquiry_source_id: b.inquiry_source_id,
              client_name: b.client_name,
              client_email: b.client_email,
              client_company: b.client_company,
              client_memo: b.client_memo,
              is_recent: b.is_recent,
              google_event_id: b.google_event_id,
              google_meet_link: b.google_meet_link,
              cancel_token: b.cancel_token,
              utm_source: b.utm_source,
              utm_medium: b.utm_medium,
              utm_campaign: b.utm_campaign,
              utm_content: b.utm_content,
              utm_term: b.utm_term,
              referrer_url: b.referrer_url,
              ip_address: b.ip_address,
              user_agent: b.user_agent,
              created_at: new Date(b.created_at),
              updated_at: new Date(b.updated_at),
              cancelled_at: b.cancelled_at ? new Date(b.cancelled_at) : null,
              staff: {
                id: b.staff.id,
                name: b.staff.name,
                email: b.staff.email,
                photo_url: b.staff.photo_url,
                is_active: b.staff.is_active,
                google_refresh_token: b.staff.google_refresh_token,
                google_token_expires_at: b.staff.google_token_expires_at ? new Date(b.staff.google_token_expires_at) : null,
                timezone: b.staff.timezone,
                created_at: new Date(b.staff.created_at),
                updated_at: new Date(b.staff.updated_at),
              },
              consultation_type: {
                id: b.consultation_type.id,
                name: b.consultation_type.name,
                duration_minutes: b.consultation_type.duration_minutes,
                buffer_before_minutes: b.consultation_type.buffer_before_minutes,
                buffer_after_minutes: b.consultation_type.buffer_after_minutes,
                mode: b.consultation_type.mode,
                recent_mode_override: b.consultation_type.recent_mode_override,
                display_order: b.consultation_type.display_order,
                is_active: b.consultation_type.is_active,
                google_meet_url: b.consultation_type.google_meet_url,
                created_at: new Date(b.consultation_type.created_at),
                updated_at: new Date(b.consultation_type.updated_at),
              },
              inquiry_source: null,
            }

            // スタッフインデックスに基づいて色を割り当て
            if (staffIndex !== -1) {
              (booking as any).color = colors[staffIndex % colors.length]
            } else {
              (booking as any).color = colors[0]
            }

            return booking
          })

          setBookings(bookingsList)
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error)
      setStaff([])
      setBookings([])
    } finally {
      setLoading(false)
    }
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

  const getTimePosition = (time: Date) => {
    const hours = time.getHours()
    const minutes = time.getMinutes()
    return ((hours - 8) * 60 + minutes) / 60 // 8時を0として計算
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
          <h1 className="text-4xl font-bold">カレンダー</h1>
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
                            const startHour = new Date(booking.start_time).getHours()
                            const startMinute = new Date(booking.start_time).getMinutes()
                            const duration = booking.duration_minutes
                            const top = (startMinute / 60) * 60
                            const height = (duration / 60) * 60

                            return (
                              <div
                                key={booking.id}
                                className="absolute left-1 right-1 rounded-md p-2 text-xs overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 hover:z-10 transition-all duration-200 ease-in-out"
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  backgroundColor: (booking as any).color || "#4285f4",
                                  color: "white",
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
                                  {booking.staff.name} - {booking.consultation_type.name}
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

      {/* 凡例 */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="text-sm font-semibold">スタッフ:</div>
        {staff.map((staffMember, index) => {
          const colors = [
            "#4285f4", "#ea4335", "#fbbc04", "#34a853", "#ff6d01", "#46bdc6",
            "#7986cb", "#f439a0", "#e67c73", "#33b679", "#8e24aa", "#039be5"
          ]
          return (
            <div key={staffMember.id} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">{staffMember.name}</span>
            </div>
          )
        })}
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

                {/* スタッフ */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">担当スタッフ</div>
                  <div className="text-lg font-semibold">{selectedBooking.staff.name}</div>
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

                {/* ステータス */}
                <div>
                  <div className="text-sm text-gray-500 mb-1">ステータス</div>
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ 確定
                  </div>
                </div>

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
                    window.location.href = `/admin/bookings/${selectedBooking.id}`
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
