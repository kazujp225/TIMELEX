"use client"

import { useState, useEffect } from "react"
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

export default function BookingPage() {
  const [step, setStep] = useState<BookingStep>("calendar")
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [inquirySources, setInquirySources] = useState<InquirySource[]>([])
  const [bookingId, setBookingId] = useState<string | null>(null)

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
