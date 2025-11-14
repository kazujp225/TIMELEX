"use client"

import { useEffect, useState } from "react"
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
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* チェックマークアニメーション */}
        <div className="mb-8 flex items-center justify-center">
          <div
            className={`w-20 h-20 rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 ${
              showCheckmark ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* 確定メッセージ */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            予約が完了しました
          </h1>
          <p className="text-gray-600 mb-2">
            ご予約ありがとうございます
          </p>
          <p className="text-sm text-gray-500">
            ご登録のメールアドレスに確認メールを送信しました
          </p>
        </div>

        {/* 予約詳細 */}
        <div className="mb-8 pb-8 border-b-2 border-gray-100">
          <div className="mb-6">
            <div className="text-sm text-gray-500 mb-2">ご予約日時</div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatDate(booking.start_time, "YYYY/MM/DD")}（{getWeekday(booking.start_time)}）
            </p>
            <p className="text-xl text-gray-700">
              {formatDate(booking.start_time, "HH:mm")}〜{formatDate(booking.end_time, "HH:mm")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">担当</div>
              <p className="text-base font-semibold text-gray-900">
                {booking.staff.name}
              </p>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">相談種別</div>
              <p className="text-base font-semibold text-gray-900">
                {booking.consultation_type.name}
              </p>
            </div>
          </div>
        </div>

        {/* ミーティングURL案内 */}
        <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            オンライン面談について
          </h3>
          <p className="text-gray-700 mb-2 font-medium">
            📧 担当者から24時間以内にメールをお送りします
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            ミーティングURLは、担当者から登録いただいたメールアドレス宛にお送りいたします。
            当日はメールに記載されているURLからご参加ください。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3 mb-12">
          <a
            href={cancelUrl}
            className="block w-full py-4 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 rounded-lg text-gray-700 font-medium text-center transition-all"
          >
            予約を変更・キャンセル
          </a>
          <a
            href="/"
            className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-center rounded-lg transition-all"
          >
            トップページに戻る
          </a>
        </div>

        {/* サンキューメッセージ */}
        <div className="pt-8 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              ご予約ありがとうございます
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ご不明な点がございましたら、お気軽にお問い合わせください。
              お会いできることを楽しみにしております。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
