"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { formatDate, getWeekday } from "@/lib/utils"
import { BookingStatus, ConsultationMode, RecentModeOverride } from "@/types"
import type { BookingWithRelations } from "@/types"

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
        <div className="animate-spin w-8 h-8 border-4 border-[#6EC5FF] border-t-transparent rounded-full" />
      </div>
    )
  }

  const cancelUrl = `/book/cancel?id=${bookingId}&token=${booking.cancel_token}`

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-white">
      <div className="container-custom text-center py-8">
        {/* チェックマークアニメーション */}
        <div className="mb-8 flex items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center transition-all duration-800 ${
              showCheckmark ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
                className={showCheckmark ? "animate-check-draw" : ""}
              />
            </svg>
          </div>
        </div>

        {/* 確定メッセージ */}
        <h1 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          予約が確定しました
        </h1>
        <p className="text-base text-[#666666] mb-8">
          ご登録のメールアドレスに確認メールを送信しました
        </p>

        {/* 予約詳細 */}
        <div className="bg-[#6EC5FF]/10 rounded-lg p-6 mb-8 text-left">
          <div className="space-y-3">
            <div>
              <p className="text-sm text-[#666666] mb-1">日時</p>
              <p className="text-xl font-bold text-[#2D2D2D]">
                {formatDate(booking.start_time, "YYYY/MM/DD")}（
                {getWeekday(booking.start_time)}）
              </p>
              <p className="text-lg font-medium text-[#2D2D2D]">
                {formatDate(booking.start_time, "HH:mm")}〜
                {formatDate(booking.end_time, "HH:mm")}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#666666] mb-1">担当</p>
              <p className="text-base font-medium text-[#2D2D2D]">
                {booking.staff.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-[#666666] mb-1">相談種別</p>
              <p className="text-base font-medium text-[#2D2D2D]">
                {booking.consultation_type.name}
              </p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Button
            onClick={() =>
              window.open(booking.google_meet_link, "_blank", "noopener,noreferrer")
            }
            className="w-full h-14 text-lg"
            variant="default"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3.5 7.5L10 12l-6.5 4.5V7.5zm0-3v15l13-7.5-13-7.5z" />
            </svg>
            Google Meetに参加
          </Button>

          <Button
            onClick={() => {
              // .icsファイルをダウンロード
              const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${booking.start_time.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
DTEND:${booking.end_time.toISOString().replace(/[-:]/g, "").split(".")[0]}Z
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
            variant="outline"
            className="w-full h-12"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            カレンダーに追加
          </Button>

          <Button
            onClick={() => (window.location.href = cancelUrl)}
            variant="ghost"
            className="w-full h-12 text-[#666666]"
          >
            予約を変更・キャンセル
          </Button>
        </div>

        {/* トップに戻る */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="link"
            className="text-[#6EC5FF]"
          >
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
