"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookingForm } from "@/components/booking/BookingForm"
import { ConsultationMode, RecentModeOverride } from "@/types"
import type { ConsultationType } from "@/types"

interface SelectedSlot {
  start_time: string
  end_time: string
  staff_id: string
  staff_name: string
  consultation_type_id: string
}

export default function BookingFormPage() {
  const router = useRouter()
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])

  useEffect(() => {
    // セッションストレージからスロット情報を取得
    const slotData = sessionStorage.getItem("selected_slot")
    if (!slotData) {
      router.push("/book")
      return
    }

    setSelectedSlot(JSON.parse(slotData))

    // TODO: APIから相談種別を取得
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
  }, [router])

  const handleFormSubmit = (id: string) => {
    // 確認ページに遷移
    router.push(`/book/confirmation?id=${id}`)
  }

  const handleBack = () => {
    const typeId = selectedSlot?.consultation_type_id
    if (typeId) {
      router.push(`/book/select-slot?type=${typeId}`)
    } else {
      router.push("/book")
    }
  }

  if (!selectedSlot) {
    return null
  }

  // Date型に変換
  const slotWithDates = {
    start_time: new Date(selectedSlot.start_time),
    end_time: new Date(selectedSlot.end_time),
    staff_id: selectedSlot.staff_id,
    staff_name: selectedSlot.staff_name,
    consultation_type_id: selectedSlot.consultation_type_id,
  }

  return (
    <>
      <BookingForm
        selectedSlot={slotWithDates}
        consultationTypes={consultationTypes}
        onSubmit={handleFormSubmit}
        onBack={handleBack}
      />
    </>
  )
}
