"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate, getWeekday } from "@/lib/utils"
import { BookingStatus, ConsultationMode, RecentModeOverride } from "@/types"
import type { BookingWithRelations } from "@/types"

type ActionType = "cancel" | "reschedule" | null

export default function CancelBookingPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")
  const cancelToken = searchParams.get("token")

  const [booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!bookingId || !cancelToken) {
      setError("無効なURLです")
      setLoading(false)
      return
    }

    // TODO: APIから予約情報を取得してトークンを検証
    // モックデータ
    const now = new Date()
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + 3)
    futureDate.setHours(15, 0, 0, 0)

    const mockBooking: BookingWithRelations = {
      id: bookingId,
      status: BookingStatus.CONFIRMED,
      start_time: futureDate,
      end_time: new Date(futureDate.getTime() + 30 * 60 * 1000),
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
      cancel_token: cancelToken,
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
    setLoading(false)
  }, [bookingId, cancelToken])

  const handleCancel = async () => {
    if (!confirm("本当にこの予約をキャンセルしますか？\n\nキャンセル後は再度予約が必要になります。")) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // TODO: APIリクエスト
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
      setActionType("cancel")
    } catch (err) {
      setError("キャンセル処理に失敗しました。もう一度お試しください。")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReschedule = () => {
    // TODO: 時間変更フローへ遷移
    alert("時間変更機能は近日実装予定です")
  }

  if (loading) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-white">
        <div className="animate-spin w-12 h-12 border-4 border-[#6EC5FF] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center py-8">
          <div className="w-24 h-24 rounded-full bg-[#FF7676]/10 flex items-center justify-center mx-auto mb-8">
            <svg className="w-12 h-12 text-[#FF7676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">エラー</h1>
          <p className="text-xl text-[#666666] mb-10">{error}</p>
          <Button onClick={() => (window.location.href = "/")} variant="outline" className="h-14 px-8 text-lg">
            トップページに戻る
          </Button>
        </div>
      </div>
    )
  }

  if (success && booking) {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center py-8">
          {/* チェックマーク */}
          <div className="mb-10 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[#4CAF50] flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">
            {actionType === "cancel" ? "予約をキャンセルしました" : "予約を変更しました"}
          </h1>
          <p className="text-xl text-[#666666] mb-10">
            {actionType === "cancel"
              ? "キャンセル完了のメールを送信しました"
              : "変更完了のメールを送信しました"}
          </p>

          {actionType === "cancel" && (
            <div className="bg-[#6EC5FF]/10 rounded-lg p-8 mb-10 text-left">
              <p className="text-base text-[#666666] mb-3">キャンセルされた予約</p>
              <p className="text-2xl font-bold text-[#2D2D2D]">
                {formatDate(booking.start_time, "YYYY/MM/DD")}（{getWeekday(booking.start_time)}）
              </p>
              <p className="text-xl font-medium text-[#2D2D2D] mt-2">
                {formatDate(booking.start_time, "HH:mm")}〜{formatDate(booking.end_time, "HH:mm")}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Button onClick={() => (window.location.href = "/book")} className="w-full h-16 text-xl">
              新しく予約する
            </Button>
            <Button onClick={() => (window.location.href = "/")} variant="outline" className="w-full h-14 text-lg">
              トップページに戻る
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  const isPast = new Date(booking.start_time) < new Date()
  const isCancelled = booking.status === BookingStatus.CANCELLED

  return (
    <div className="min-h-screen-safe bg-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D2D2D] mb-2">予約の確認・変更</h1>
          <p className="text-lg text-[#666666]">予約内容を確認し、必要に応じて変更・キャンセルできます</p>
        </div>

        {/* 予約情報カード */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">予約情報</CardTitle>
            <CardDescription className="text-lg">現在の予約内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-base text-muted-foreground font-medium">予約日時</p>
              <p className="text-3xl font-bold text-[#2D2D2D] mt-2">
                {formatDate(booking.start_time, "YYYY年MM月DD日")}（{getWeekday(booking.start_time)}）
              </p>
              <p className="text-2xl font-semibold text-[#2D2D2D] mt-1">
                {formatDate(booking.start_time, "HH:mm")} - {formatDate(booking.end_time, "HH:mm")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-base text-muted-foreground font-medium">担当</p>
                <p className="text-xl font-medium mt-2">{booking.staff.name}</p>
              </div>
              <div>
                <p className="text-base text-muted-foreground font-medium">相談種別</p>
                <p className="text-xl font-medium mt-2">{booking.consultation_type.name}</p>
              </div>
            </div>

            <div>
              <p className="text-base text-muted-foreground font-medium">お名前</p>
              <p className="text-xl font-medium mt-2">{booking.client_name}</p>
            </div>

            <div>
              <p className="text-base text-muted-foreground font-medium">メールアドレス</p>
              <p className="text-xl font-medium mt-2">{booking.client_email}</p>
            </div>

            {booking.google_meet_link && (
              <div>
                <p className="text-base text-muted-foreground font-medium mb-3">Google Meet</p>
                <Button
                  onClick={() => window.open(booking.google_meet_link, "_blank", "noopener,noreferrer")}
                  className="w-full h-14 text-lg"
                  variant="outline"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3.5 7.5L10 12l-6.5 4.5V7.5zm0-3v15l13-7.5-13-7.5z" />
                  </svg>
                  Meetに参加
                </Button>
              </div>
            )}

            {/* ステータス表示 */}
            <div>
              <p className="text-base text-muted-foreground font-medium mb-3">ステータス</p>
              {isCancelled ? (
                <span className="inline-flex items-center px-6 py-3 rounded-lg bg-destructive/10 text-destructive font-semibold text-lg">
                  ✕ キャンセル済み
                </span>
              ) : isPast ? (
                <span className="inline-flex items-center px-6 py-3 rounded-lg bg-muted text-muted-foreground font-semibold text-lg">
                  完了
                </span>
              ) : (
                <span className="inline-flex items-center px-6 py-3 rounded-lg bg-success/10 text-success font-semibold text-lg">
                  ✓ 確定
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* アクションボタン */}
        {!isPast && !isCancelled && (
          <div className="space-y-4">
            <Button
              onClick={handleReschedule}
              className="w-full h-16 text-xl"
              variant="outline"
              disabled={isProcessing}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              日時を変更する
            </Button>

            <Button
              onClick={handleCancel}
              className="w-full h-16 text-xl"
              variant="destructive"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>処理中...</span>
                </div>
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  予約をキャンセルする
                </>
              )}
            </Button>
          </div>
        )}

        {(isPast || isCancelled) && (
          <div className="space-y-4">
            <Button onClick={() => (window.location.href = "/book")} className="w-full h-16 text-xl">
              新しく予約する
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-6 bg-[#FF7676]/10 border-2 border-[#FF7676]/30 rounded-lg">
            <p className="text-[#FF7676] font-medium text-lg">{error}</p>
          </div>
        )}

        {/* トップに戻る */}
        <div className="mt-12 text-center">
          <Button onClick={() => (window.location.href = "/")} variant="link" className="text-[#6EC5FF] text-lg">
            トップページに戻る
          </Button>
        </div>
      </div>
    </div>
  )
}
