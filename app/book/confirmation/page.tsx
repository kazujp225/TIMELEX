"use client"

import { useSearchParams } from "next/navigation"
import { BookingConfirmation } from "@/components/booking/BookingConfirmation"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("id")

  if (!bookingId) {
    return (
      <div className="min-h-screen-safe bg-white flex items-center justify-center">
        <p className="text-muted">予約情報が見つかりません</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe bg-white">
      <BookingConfirmation bookingId={bookingId} />
    </div>
  )
}
