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
  const [editingStaff, setEditingStaff] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>("client")
  const [viewMode, setViewMode] = useState<"week" | "day">("week") // デフォルトは週表示
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

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
              inquiry_source: {
                id: b.inquiry_source_id || "",
                name: "不明",
                display_order: 0,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
              },
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

  const handleChangeStaff = async () => {
    if (!selectedBooking || !selectedStaffId) return

    try {
      setSaving(true)
      const { supabase } = await import("@/lib/supabase")

      const { error } = await supabase
        .from("bookings")
        .update({ staff_id: selectedStaffId })
        .eq("id", selectedBooking.id)

      if (error) {
        console.error("Failed to update staff:", error)
        alert("スタッフの変更に失敗しました")
        return
      }

      // 成功したらデータを再読み込み
      await loadData()
      setEditingStaff(false)
      setSelectedBooking(null)
      alert("担当スタッフを変更しました")
    } catch (error) {
      console.error("Error updating staff:", error)
      alert("スタッフの変更に失敗しました")
    } finally {
      setSaving(false)
    }
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

  // スワイプジェスチャー用のハンドラー
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      if (viewMode === "week") {
        goToNextWeek()
      } else {
        goToNextDay()
      }
    }
    if (isRightSwipe) {
      if (viewMode === "week") {
        goToPreviousWeek()
      } else {
        goToPrevDay()
      }
    }
  }

  const goToNextDay = () => {
    const next = new Date(currentDate)
    next.setDate(next.getDate() + 1)
    setCurrentDate(next)
  }

  const goToPrevDay = () => {
    const prev = new Date(currentDate)
    prev.setDate(prev.getDate() - 1)
    setCurrentDate(prev)
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
  // 8:00 - 20:00 (13時間分)
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-[1800px] pb-6">
      {/* ヘッダー */}
      <div className="flex flex-col gap-4">
        {/* タイトルとビュー切り替え */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold">カレンダー</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-lg">
              {viewMode === "week" ? (
                <>
                  {formatDate(weekDays[0], "YYYY年MM月DD日")} 〜 {formatDate(weekDays[6], "MM月DD日")}
                </>
              ) : (
                formatDate(currentDate, "YYYY年MM月DD日 (ddd)")
              )}
            </p>
          </div>

          {/* デスクトップ用ビュー切り替え */}
          <div className="hidden md:flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              週表示
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              日表示
            </button>
          </div>
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between gap-2">
          {/* モバイル用ビュー切り替え */}
          <div className="flex md:hidden gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              週
            </button>
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === "day"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              日
            </button>
          </div>

          {/* ナビゲーションボタン */}
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              onClick={viewMode === "week" ? goToPreviousWeek : goToPrevDay}
              className="h-9 md:h-12 px-3 md:px-6 text-sm md:text-base"
            >
              <span className="hidden md:inline">← {viewMode === "week" ? "前週" : "前日"}</span>
              <span className="md:hidden">←</span>
            </Button>
            <Button
              variant="default"
              onClick={goToToday}
              className="h-9 md:h-12 px-4 md:px-8 font-semibold text-sm md:text-base"
            >
              今日
            </Button>
            <Button
              variant="outline"
              onClick={viewMode === "week" ? goToNextWeek : goToNextDay}
              className="h-9 md:h-12 px-3 md:px-6 text-sm md:text-base"
            >
              <span className="hidden md:inline">{viewMode === "week" ? "次週" : "翌日"} →</span>
              <span className="md:hidden">→</span>
            </Button>
          </div>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <Card className="border overflow-hidden bg-white">
        <CardContent className="p-0">
          <div
            className="overflow-x-auto touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {viewMode === "week" ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* ヘッダー: 日付（デスクトップ） */}
                <div className="grid grid-cols-[64px_repeat(7,minmax(140px,1fr))] border-b bg-white z-10 hidden md:grid">
                  <div className="border-r"></div>
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

                {/* ヘッダー: 日付（モバイル） */}
                <div className="grid grid-cols-[56px_repeat(7,minmax(60px,1fr))] border-b bg-white z-10 md:hidden">
                  <div className="border-r"></div>
                  {weekDays.map((day, index) => {
                    const today = isToday(day)
                    const dayName = ["日", "月", "火", "水", "木", "金", "土"][day.getDay()]
                    return (
                      <div
                        key={index}
                        className={`p-2 text-center border-r ${today ? "bg-blue-50" : ""}`}
                      >
                        <div className={`text-xs font-medium ${
                          index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-500"
                        }`}>
                          {dayName}
                        </div>
                        <div className={`text-lg font-semibold mt-0.5 ${
                          today ? "w-7 h-7 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center text-sm" : ""
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
                  className="grid grid-cols-[56px_repeat(7,minmax(60px,1fr))] md:grid-cols-[64px_repeat(7,minmax(140px,1fr))] border-b h-[60px]"
                >
                  {/* 時間表示 */}
                  <div className="border-r p-2 text-sm md:text-base text-gray-500 text-right pr-2 md:pr-3 w-14 md:w-16 flex-shrink-0">
                    {hour}:00
                  </div>

                  {/* 各日のセル */}
                  {weekDays.map((day, dayIndex) => {
                    const today = isToday(day)
                    return (
                      <div
                        key={dayIndex}
                        className={`border-r relative min-w-[60px] ${today ? "bg-blue-50/30" : ""}`}
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
                                className="absolute left-0.5 right-0.5 md:left-1 md:right-1 rounded-md p-1 md:p-2 text-[10px] md:text-xs overflow-hidden shadow-sm hover:shadow-xl hover:scale-105 hover:z-10 transition-all duration-200 ease-in-out cursor-pointer"
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  backgroundColor: (booking as any).color || "#4285f4",
                                  color: "white",
                                }}
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <div className="font-semibold truncate">
                                  <span className="hidden md:inline">{formatDate(booking.start_time, "HH:mm")} </span>
                                  {booking.client_name}様
                                </div>
                                <div className="text-[9px] md:text-[10px] opacity-90 truncate mt-0.5 hidden md:block">
                                  {booking.staff.name} - {booking.consultation_type.name}
                                </div>
                                {(booking.consultation_type.google_meet_url || booking.google_meet_link) && (
                                  <div
                                    className="mt-1 pt-1 border-t border-white/20 hidden md:block"
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
            ) : (
              <div className="relative">
                {/* 日付ヘッダー */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b z-10">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">
                      {["日", "月", "火", "水", "木", "金", "土"][currentDate.getDay()]}曜日
                    </div>
                    <div className="text-3xl font-bold text-gray-800 mt-1">
                      {currentDate.getDate()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                    </div>
                  </div>
                </div>

                {/* タイムグリッド */}
                <div className="relative">
                  {hours.map((hour) => {
                    const dayBookings = getBookingsForDate(currentDate).filter((booking) => {
                      const bookingHour = new Date(booking.start_time).getHours()
                      return bookingHour === hour
                    })

                    return (
                      <div
                        key={hour}
                        className="flex border-b min-h-[80px] md:min-h-[60px]"
                      >
                        {/* 時間表示 */}
                        <div className="w-14 md:w-16 border-r p-2 md:p-3 text-sm md:text-base text-gray-500 text-right pr-2 md:pr-3 flex-shrink-0">
                          {hour}:00
                        </div>

                        {/* 予約表示エリア */}
                        <div className="flex-1 relative bg-white hover:bg-gray-50 transition-colors p-2">
                          {dayBookings.length === 0 ? (
                            <div className="text-gray-300 text-sm h-full flex items-center justify-center">
                              予約なし
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {dayBookings.map((booking) => {
                                const startMinute = new Date(booking.start_time).getMinutes()
                                const duration = booking.duration_minutes

                                return (
                                  <div
                                    key={booking.id}
                                    className="rounded-lg p-3 md:p-4 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer"
                                    style={{
                                      backgroundColor: (booking as any).color || "#4285f4",
                                      color: "white",
                                    }}
                                    onClick={() => setSelectedBooking(booking)}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="font-bold text-base md:text-lg mb-1">
                                          {booking.client_name}様
                                        </div>
                                        <div className="text-sm opacity-90 mb-2">
                                          {formatDate(booking.start_time, "HH:mm")} - {formatDate(new Date(new Date(booking.start_time).getTime() + duration * 60000), "HH:mm")}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                          <span className="bg-white/20 px-2 py-1 rounded">
                                            {booking.staff.name}
                                          </span>
                                          <span className="bg-white/20 px-2 py-1 rounded">
                                            {booking.consultation_type.name}
                                          </span>
                                          <span className="bg-white/20 px-2 py-1 rounded">
                                            {duration}分
                                          </span>
                                        </div>
                                      </div>
                                      {(booking.consultation_type.google_meet_url || booking.google_meet_link) && (
                                        <a
                                          href={booking.consultation_type.google_meet_url || booking.google_meet_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-shrink-0 bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                                          </svg>
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 凡例 */}
      <div className="flex items-center gap-3 md:gap-6 flex-wrap px-1">
        <div className="text-xs md:text-sm font-semibold text-gray-700">スタッフ:</div>
        {staff.map((staffMember, index) => {
          const colors = [
            "#4285f4", "#ea4335", "#fbbc04", "#34a853", "#ff6d01", "#46bdc6",
            "#7986cb", "#f439a0", "#e67c73", "#33b679", "#8e24aa", "#039be5"
          ]
          return (
            <div key={staffMember.id} className="flex items-center gap-1.5 md:gap-2">
              <div
                className="w-3 h-3 md:w-4 md:h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-xs md:text-sm">{staffMember.name}</span>
            </div>
          )
        })}
      </div>

      {/* 予約詳細モーダル */}
      {selectedBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
          onClick={() => {
            setSelectedBooking(null)
            setEditingStaff(false)
          }}
        >
          <Card
            className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex justify-between items-start mb-3 md:mb-4">
                <h2 className="text-xl md:text-2xl font-bold">予約詳細</h2>
                <button
                  onClick={() => {
                    setSelectedBooking(null)
                    setEditingStaff(false)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl md:text-3xl -mt-1"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                {/* 予約サマリー - 常に表示 */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 md:p-4 rounded-lg border border-blue-200">
                  <div className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    {formatDate(selectedBooking.start_time, "MM/DD(ddd)")} {formatDate(selectedBooking.start_time, "HH:mm")}
                  </div>
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 flex-wrap">
                    <span>{selectedBooking.consultation_type.name}</span>
                    <span className="hidden md:inline">·</span>
                    <span>{selectedBooking.duration_minutes}分</span>
                  </div>
                </div>

                {/* 担当スタッフ変更 - アコーディオン */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "staff" ? null : "staff")}
                    className="w-full flex items-center justify-between text-left py-3 px-4 hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-semibold text-gray-800">担当スタッフ変更</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "staff" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSection === "staff" && (
                    <div className="px-4 pb-4 space-y-3">
                      <select
                        value={selectedStaffId || selectedBooking.staff_id}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          onClick={handleChangeStaff}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                        >
                          {saving ? "保存中..." : "変更を保存"}
                        </button>
                        <button
                          onClick={() => setExpandedSection(null)}
                          disabled={saving}
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* クライアント情報 - アコーディオン */}
                <div className="border rounded-lg">
                  <button
                    onClick={() => setExpandedSection(expandedSection === "client" ? null : "client")}
                    className="w-full flex items-center justify-between text-left py-3 px-4 hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-semibold text-gray-800">お客様情報</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "client" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedSection === "client" && (
                    <div className="px-4 pb-4 space-y-3">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">お名前</div>
                        <div className="font-semibold text-gray-800">{selectedBooking.client_name}様</div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-xs text-gray-500 mb-1">メールアドレス</div>
                        <a
                          href={`mailto:${selectedBooking.client_email}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {selectedBooking.client_email}
                        </a>
                      </div>

                      {selectedBooking.client_company && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500 mb-1">会社名</div>
                          <div className="font-medium text-gray-800">{selectedBooking.client_company}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 相談要件・メモ - アコーディオン */}
                {selectedBooking.client_memo && (
                  <div className="border rounded-lg">
                    <button
                      onClick={() => setExpandedSection(expandedSection === "memo" ? null : "memo")}
                      className="w-full flex items-center justify-between text-left py-3 px-4 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-semibold text-gray-800">相談要件・メモ</span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === "memo" ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {expandedSection === "memo" && (
                      <div className="px-4 pb-4">
                        <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-md border border-gray-200">
                          {selectedBooking.client_memo}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Google Meet URL */}
                {(selectedBooking.consultation_type.google_meet_url || selectedBooking.google_meet_link) && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-2">Google Meet</div>
                    <a
                      href={selectedBooking.consultation_type.google_meet_url || selectedBooking.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🎥 Meetに参加
                    </a>
                  </div>
                )}

                {/* ステータス */}
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">ステータス</div>
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    ✓ 確定
                  </div>
                </div>

                {/* 予約日時 */}
                <div className="text-xs text-gray-400">
                  予約作成: {formatDate(selectedBooking.created_at, "YYYY/MM/DD HH:mm")}
                </div>
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
