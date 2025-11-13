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

    // API経由で予約情報を取得
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`)

        if (!response.ok) {
          console.error("Failed to fetch booking:", response.statusText)
          return
        }

        const { booking: data } = await response.json()

        if (data) {
          console.log("✅ Booking data fetched:", data)

          // Date型に変換
          const bookingData: any = {
            ...data,
            start_time: new Date(data.start_time),
            end_time: new Date(data.end_time),
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
            cancelled_at: data.cancelled_at ? new Date(data.cancelled_at) : null,
            staff: {
              ...data.staff,
              created_at: new Date(data.staff.created_at),
              updated_at: new Date(data.staff.updated_at),
              google_token_expires_at: data.staff.google_token_expires_at
                ? new Date(data.staff.google_token_expires_at)
                : null,
            },
            consultation_type: {
              ...data.consultation_type,
              created_at: new Date(data.consultation_type.created_at),
              updated_at: new Date(data.consultation_type.updated_at),
            },
          }

          console.log("✅ Processed booking data:", bookingData)
          setBooking(bookingData)
        }
      } catch (error) {
        console.error("Error fetching booking:", error)
      }
    }

    fetchBooking()
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
    <div className="min-h-screen-safe bg-panel py-4 sm:py-8">
      <div className="w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full sm:max-w-3xl mx-auto">
          <div className="text-center">
            {/* チェックマークアニメーション */}
            <div className="mb-4 sm:mb-8 flex items-center justify-center">
              <div
                className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl bg-success flex items-center justify-center transition-all duration-800 shadow-sm ${
                  showCheckmark ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
              >
                <svg
                  className="w-8 sm:w-10 h-8 sm:h-10 text-white"
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text mb-2 sm:mb-3" style={{ fontVariantNumeric: "tabular-nums" }}>
              ご予約ありがとうございました
            </h1>
            <p className="text-sm sm:text-base text-muted mb-2">
              予約が確定しました
            </p>
            <p className="text-xs sm:text-sm text-muted mb-4 sm:mb-8">
              ご登録のメールアドレスに確認メールを送信しました
            </p>

            {/* 予約詳細 */}
            <Card className="mb-4 sm:mb-8 text-left">
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs text-muted font-medium mb-1 sm:mb-2">日時</p>
                  <p className="text-lg sm:text-xl font-extrabold text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatDate(booking.start_time, "YYYY/MM/DD")}（
                    {getWeekday(booking.start_time)}）
                  </p>
                  <p className="text-base sm:text-lg font-bold text-text mt-1" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatDate(booking.start_time, "HH:mm")}〜
                    {formatDate(booking.end_time, "HH:mm")}
                  </p>
                </div>

                <div className="h-px bg-border" />

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs text-muted font-medium mb-1 sm:mb-2">担当</p>
                    <p className="text-sm sm:text-base font-bold text-text">
                      {booking.staff.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted font-medium mb-1 sm:mb-2">相談種別</p>
                    <p className="text-sm sm:text-base font-bold text-text">
                      {booking.consultation_type.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ミーティングURL案内 */}
            <Card className="mb-4 sm:mb-6 text-left bg-brand-50">
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-brand-600">
                  <Video className="w-5 h-5" aria-hidden="true" />
                  <p className="text-sm sm:text-base font-bold">オンライン面談について</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-brand-200">
                  <p className="text-sm sm:text-base text-text font-medium mb-2">
                    📧 担当者から24時間以内にメールをお送りします
                  </p>
                  <p className="text-xs sm:text-sm text-muted leading-relaxed">
                    ミーティングURLは、担当者から登録いただいたメールアドレス宛にお送りいたします。<br />
                    当日はメールに記載されているURLからご参加ください。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = cancelUrl)}
                variant="secondary"
                size="lg"
                fullWidth
              >
                予約を変更・キャンセル
              </Button>
            </div>

            {/* サンキューメッセージ */}
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
              <div className="bg-panel-muted rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-text mb-2">
                  ご予約ありがとうございます
                </h2>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  ご不明な点がございましたら、お気軽にお問い合わせください。<br />
                  お会いできることを楽しみにしております。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
