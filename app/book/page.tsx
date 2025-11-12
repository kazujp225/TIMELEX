"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { BookingCalendar } from "@/components/booking/BookingCalendar"
import { BookingForm } from "@/components/booking/BookingForm"
import { BookingConfirmation } from "@/components/booking/BookingConfirmation"
import { ConsultationMode, RecentModeOverride } from "@/types"
import type { ConsultationType, InquirySource } from "@/types"

type BookingStep = "calendar" | "form" | "confirmation"

interface SelectedSlot {
  start_time: Date
  end_time: Date
  staff_id: string
  staff_name: string
}

interface TrackingData {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  referrer: string | null
  landing_page: string | null
}

export default function BookingPage() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<BookingStep>("calendar")
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [inquirySources, setInquirySources] = useState<InquirySource[]>([])
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)

  // UTM/リファラ追跡データ取得
  useEffect(() => {
    const tracking: TrackingData = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_term: searchParams.get("utm_term"),
      utm_content: searchParams.get("utm_content"),
      referrer: document.referrer || null,
      landing_page: window.location.href,
    }

    setTrackingData(tracking)

    // デバッグログ（開発時のみ）
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Tracking data captured:", tracking)
    }

    // TODO: セッションストレージに保存して予約完了まで保持
    if (typeof window !== "undefined") {
      sessionStorage.setItem("booking_tracking", JSON.stringify(tracking))
    }
  }, [searchParams])

  // 初期データ取得（相談種別、お問い合わせ元）
  useEffect(() => {
    // TODO: APIから取得
    // 仮データ
    setConsultationTypes([
      {
        id: "1",
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
    ])

    setInquirySources([
      {
        id: "1",
        name: "自社コーポレートサイト",
        display_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
  }, [])

  const handleSlotSelect = (slot: SelectedSlot) => {
    setSelectedSlot(slot)
    setStep("form")
  }

  const handleFormSubmit = (id: string) => {
    setBookingId(id)
    setStep("confirmation")
  }

  const handleBack = () => {
    if (step === "form") {
      setStep("calendar")
      setSelectedSlot(null)
    }
  }

  return (
    <div className="min-h-screen-safe bg-white">
      {/* デバッグ用トラッキング情報表示（開発時のみ） - 非表示 */}
      {false && process.env.NODE_ENV === "development" && trackingData && (
        <div className="fixed top-2 right-2 z-50 max-w-xs bg-black/90 text-white text-xs p-3 rounded-lg shadow-xl">
          <div className="font-bold mb-2 flex items-center gap-2">
            <span>📊</span>
            <span>追跡データ</span>
          </div>
          <div className="space-y-1 font-mono">
            {trackingData.utm_source && (
              <div>
                <span className="text-blue-300">utm_source:</span> {trackingData.utm_source}
              </div>
            )}
            {trackingData.utm_medium && (
              <div>
                <span className="text-blue-300">utm_medium:</span> {trackingData.utm_medium}
              </div>
            )}
            {trackingData.utm_campaign && (
              <div>
                <span className="text-blue-300">utm_campaign:</span> {trackingData.utm_campaign}
              </div>
            )}
            {trackingData.referrer && (
              <div>
                <span className="text-green-300">referrer:</span>{" "}
                {trackingData.referrer.substring(0, 30)}...
              </div>
            )}
            {!trackingData.utm_source &&
              !trackingData.utm_medium &&
              !trackingData.utm_campaign &&
              !trackingData.referrer && (
                <div className="text-gray-400">トラッキングデータなし</div>
              )}
          </div>
        </div>
      )}

      {step === "calendar" && (
        <BookingCalendar
          consultationTypes={consultationTypes}
          onSlotSelect={handleSlotSelect}
        />
      )}

      {step === "form" && selectedSlot && (
        <BookingForm
          selectedSlot={selectedSlot}
          consultationTypes={consultationTypes}
          inquirySources={inquirySources}
          onSubmit={handleFormSubmit}
          onBack={handleBack}
        />
      )}

      {step === "confirmation" && bookingId && (
        <BookingConfirmation bookingId={bookingId} />
      )}
    </div>
  )
}
