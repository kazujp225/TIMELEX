"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/Button"
import { Card, CardContent } from "@/src/components/ui/Card"
import { formatDate, getWeekday } from "@/lib/utils"
import { BookingStatus, ConsultationMode, RecentModeOverride } from "@/types"
import type { BookingWithRelations } from "@/types"
import { Calendar, Video } from "lucide-react"

interface BookingConfirmationProps {
  bookingId: string
}

export function BookingConfirmation({ bookingId }: BookingConfirmationProps) {
  const [booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [showCheckmark, setShowCheckmark] = useState(false)

  useEffect(() => {
    // アニメーション
    setTimeout(() => setShowCheckmark(true), 100)

    // TODO: APIから予約情報を取得
    // 仮データ
    const now = new Date()
    now.setHours(15, 0, 0, 0)

    const mockBooking: BookingWithRelations = {
      id: bookingId,
      status: BookingStatus.CONFIRMED,
      start_time: now,
      end_time: new Date(now.getTime() + 30 * 60 * 1000),
      duration_minutes: 30,
      staff_id: "staff-1",
      consultation_type_id: "type-1",
      inquiry_source_id: "source-1",
      client_name: "山田 太郎",
      client_email: "yamada@example.com",
      client_company: "株式会社〇〇",
      client_memo: null,
      is_recent: false,
      google_event_id: "event-123",
      google_meet_link: "https://meet.google.com/abc-defg-hij",
      cancel_token: "token-123",
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
        name: "初回相談（AI導入）",
        duration_minutes: 30,
        buffer_before_minutes: 5,
        buffer_after_minutes: 5,
        mode: ConsultationMode.IMMEDIATE,
        recent_mode_override: RecentModeOverride.KEEP,
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      inquiry_source: {
        id: "source-1",
        name: "自社コーポレートサイト",
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    }

    setBooking(mockBooking)
  }, [bookingId])

  if (!booking) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const cancelUrl = `/book/cancel?id=${bookingId}&token=${booking.cancel_token}`

  return (
    <div className="min-h-screen-safe bg-panel py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            {/* チェックマークアニメーション */}
            <div className="mb-8 flex items-center justify-center">
              <div
                className={`w-20 h-20 rounded-xl bg-success flex items-center justify-center transition-all duration-800 shadow-sm ${
                  showCheckmark ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
              >
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                    className={showCheckmark ? "animate-check-draw" : ""}
                  />
                </svg>
              </div>
            </div>

            {/* 確定メッセージ */}
            <h1 className="text-3xl font-extrabold text-text mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
              予約が確定しました
            </h1>
            <p className="text-base text-muted mb-8">
              ご登録のメールアドレスに確認メールを送信しました
            </p>

            {/* 予約詳細 */}
            <Card className="mb-8 text-left">
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted font-medium mb-2">日時</p>
                  <p className="text-xl font-extrabold text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatDate(booking.start_time, "YYYY/MM/DD")}（
                    {getWeekday(booking.start_time)}）
                  </p>
                  <p className="text-lg font-bold text-text mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatDate(booking.start_time, "HH:mm")}〜
                    {formatDate(booking.end_time, "HH:mm")}
                  </p>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted font-medium mb-2">担当</p>
                    <p className="text-base font-bold text-text">
                      {booking.staff.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted font-medium mb-2">相談種別</p>
                    <p className="text-base font-bold text-text">
                      {booking.consultation_type.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button
                onClick={() =>
                  window.open(booking.google_meet_link, "_blank", "noopener,noreferrer")
                }
                variant="primary"
                size="lg"
                fullWidth
                icon={<Video className="w-5 h-5" aria-hidden="true" />}
              >
                Google Meetに参加
              </Button>

              <Button
                onClick={() => {
                  const icsStart = booking.start_time.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                  const icsEnd = booking.end_time.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
                  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${icsStart}
DTEND:${icsEnd}
SUMMARY:${booking.consultation_type.name}
DESCRIPTION:Google Meet: ${booking.google_meet_link}
LOCATION:${booking.google_meet_link}
END:VEVENT
END:VCALENDAR`

                  const blob = new Blob([icsContent], { type: "text/calendar" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = "booking.ics"
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                variant="secondary"
                size="md"
                fullWidth
                icon={<Calendar className="w-5 h-5" aria-hidden="true" />}
              >
                カレンダーに追加
              </Button>

              <Button
                onClick={() => (window.location.href = cancelUrl)}
                variant="ghost"
                size="md"
                fullWidth
              >
                予約を変更・キャンセル
              </Button>
            </div>

            {/* トップに戻る */}
            <div className="mt-12 pt-8 border-t border-border">
              <button
                onClick={() => (window.location.href = "/")}
                className="text-brand-600 hover:text-brand-500 text-sm font-medium transition-colors"
              >
                トップページに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
