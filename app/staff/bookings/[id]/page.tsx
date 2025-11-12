"use client"

import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatDate, getWeekday } from "@/lib/utils"
import type { BookingWithRelations } from "@/types"
import Link from "next/link"

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookingDetail()
  }, [bookingId])

  const loadBookingDetail = () => {
    setLoading(true)

    // モックデータ
    const now = new Date()
    const mockBooking: BookingWithRelations = {
      id: bookingId,
      status: "confirmed" as any,
      start_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0),
      end_time: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 30),
      duration_minutes: 30,
      staff_id: "staff-1",
      consultation_type_id: "type-1",
      inquiry_source_id: "source-1",
      client_name: "山田 太郎",
      client_email: "yamada@example.com",
      client_company: "株式会社サンプル",
      client_phone: "090-1234-5678",
      client_memo: "初回相談希望。AI導入について詳しく聞きたい。",
      is_recent: false,
      google_event_id: "event-1",
      google_meet_link: "https://meet.google.com/abc-defg-hij",
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

    setBooking(mockBooking)
    setLoading(false)
  }

  const handleReschedule = () => {
    // TODO: 時間変更モーダルを表示
    alert("時間変更機能は実装予定です")
  }

  const handleCancel = () => {
    if (!confirm("この予約をキャンセルしますか？")) return
    // TODO: キャンセル処理
    alert("キャンセル処理を実行します")
    router.push("/staff/bookings")
  }

  const handleComplete = () => {
    if (!confirm("この予約を完了にしますか？")) return
    // TODO: 完了処理
    alert("完了処理を実行します")
    router.push("/staff/bookings")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="space-y-8 ">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-4">予約が見つかりません</p>
              <Link href="/staff/bookings">
                <Button>予約一覧に戻る</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isUpcoming = booking.status === "confirmed" && new Date(booking.start_time) > new Date()
  const isPast = new Date(booking.start_time) < new Date()

  return (
    <div className="space-y-8 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/staff/bookings"
            className="text-sm text-primary hover:underline flex items-center gap-1 mb-3"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            予約一覧に戻る
          </Link>
          <h1 className="text-4xl font-bold">予約詳細</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            予約ID: {booking.id}
          </p>
        </div>

        <div className="flex gap-3">
          {isUpcoming && (
            <>
              <Button variant="outline" onClick={handleReschedule} className="h-12 px-8 text-base">
                時間変更
              </Button>
              <Button variant="destructive" onClick={handleCancel} className="h-12 px-8 text-base">
                キャンセル
              </Button>
            </>
          )}
          {isPast && booking.status === "confirmed" && (
            <Button onClick={handleComplete} className="h-12 px-8 text-base">
              完了にする
            </Button>
          )}
        </div>
      </div>

      {/* Date & Time Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">日時</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground font-medium">日付</label>
              <p className="text-2xl font-bold mt-1">
                {formatDate(booking.start_time, "YYYY年MM月DD日")}（{getWeekday(booking.start_time)}）
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium">時間</label>
              <p className="text-2xl font-bold mt-1">
                {formatDate(booking.start_time, "HH:mm")} - {formatDate(booking.end_time, "HH:mm")}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground font-medium">相談種別</label>
            <p className="text-xl font-semibold mt-1">{booking.consultation_type.name}</p>
            <p className="text-sm text-muted-foreground mt-1">
              所要時間: {booking.duration_minutes}分
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Client Info Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">クライアント情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground font-medium">お名前</label>
              <p className="text-xl font-semibold mt-1">{booking.client_name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium">メールアドレス</label>
              <p className="text-xl mt-1">
                <a href={`mailto:${booking.client_email}`} className="text-primary hover:underline">
                  {booking.client_email}
                </a>
              </p>
            </div>
          </div>
          {booking.client_company && (
            <div>
              <label className="text-sm text-muted-foreground font-medium">会社名</label>
              <p className="text-xl font-semibold mt-1">{booking.client_company}</p>
            </div>
          )}
          {booking.client_phone && (
            <div>
              <label className="text-sm text-muted-foreground font-medium">電話番号</label>
              <p className="text-xl mt-1">
                <a href={`tel:${booking.client_phone}`} className="text-primary hover:underline">
                  {booking.client_phone}
                </a>
              </p>
            </div>
          )}
          {booking.client_memo && (
            <div>
              <label className="text-sm text-muted-foreground font-medium">備考・メモ</label>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4 mt-2">
                <p className="text-base text-amber-900">{booking.client_memo}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting Info Card */}
      {booking.google_meet_link && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">オンライン会議</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground font-medium">Google Meet リンク</label>
              <div className="mt-2 flex items-center gap-4">
                <a
                  href={booking.google_meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-base font-semibold"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Meetに参加
                </a>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                {booking.google_meet_link}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info Card */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">その他の情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground font-medium">ステータス</label>
              <div className="mt-2">
                {booking.status === "confirmed" && (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-success/10 text-success font-semibold text-base">
                    ✓ 確定
                  </span>
                )}
                {booking.status === "cancelled" && (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-semibold text-base">
                    ✕ キャンセル
                  </span>
                )}
                {booking.status === "completed" && (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-muted text-muted-foreground font-semibold text-base">
                    ✓ 完了
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium">顧客区分</label>
              <div className="mt-2">
                {booking.is_recent ? (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border-2 border-blue-200 font-semibold text-base">
                    🔄 継続顧客
                  </span>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-50 text-green-700 border-2 border-green-200 font-semibold text-base">
                    ✨ 新規顧客
                  </span>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground font-medium">お問い合わせ元</label>
            <p className="text-xl mt-1">{booking.inquiry_source.name}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground font-medium">予約作成日時</label>
              <p className="text-base mt-1">
                {formatDate(booking.created_at, "YYYY/MM/DD HH:mm")}
              </p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground font-medium">最終更新日時</label>
              <p className="text-base mt-1">
                {formatDate(booking.updated_at, "YYYY/MM/DD HH:mm")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
