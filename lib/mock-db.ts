/**
 * インメモリデータベース（Supabase不要の簡易版）
 * 注意: サーバー再起動でデータが消えます
 */

interface Booking {
  id: string
  client_name: string
  client_email: string
  client_company?: string
  client_memo?: string
  start_time: string
  end_time: string
  duration_minutes: number
  staff_id: string
  staff_name: string
  consultation_type_id: string
  consultation_type_name: string
  status: string
  cancel_token: string
  created_at: string
}

interface TimeSlot {
  time: Date
  availableStaff: Array<{ id: string; name: string; color: string }>
}

// インメモリストレージ
const bookings: Booking[] = []

// モックスタッフデータ
export const MOCK_STAFF = [
  { id: "staff-1", name: "担当者A", email: "staff-a@zettai.co.jp", color: "#6EC5FF" },
  { id: "staff-2", name: "担当者B", email: "staff-b@zettai.co.jp", color: "#FFC870" },
]

// モック相談種別
export const MOCK_CONSULTATION_TYPES = [
  { id: "type-1", name: "商材1 - ベーシック相談", duration_minutes: 30 },
  { id: "type-2", name: "商材2 - プレミアム相談", duration_minutes: 60 },
  { id: "type-3", name: "商材3 - エンタープライズ相談", duration_minutes: 45 },
  { id: "type-4", name: "商材4 - コンサルティング", duration_minutes: 90 },
  { id: "type-5", name: "商材5 - サポート相談", duration_minutes: 30 },
  { id: "type-6", name: "商材6 - カスタム相談", duration_minutes: 60 },
]

/**
 * 予約を作成
 */
export function createBooking(data: Omit<Booking, "id" | "created_at">): Booking {
  const booking: Booking = {
    ...data,
    id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
  }

  bookings.push(booking)
  return booking
}

/**
 * 指定日の空き枠を取得
 */
export function getAvailableSlots(date: Date, _consultationTypeId: string): TimeSlot[] {
  const slots: TimeSlot[] = []
  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  // 9:00〜18:00の30分刻みで枠を生成
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotTime = new Date(targetDate)
      slotTime.setHours(hour, minute, 0, 0)

      // 過去の時間はスキップ
      if (slotTime < new Date()) continue

      // この時間帯に予約があるスタッフを除外
      const availableStaff = MOCK_STAFF.filter(staff => {
        return !bookings.some(booking => {
          const bookingStart = new Date(booking.start_time)
          const bookingEnd = new Date(booking.end_time)
          return (
            booking.staff_id === staff.id &&
            slotTime >= bookingStart &&
            slotTime < bookingEnd
          )
        })
      })

      if (availableStaff.length > 0) {
        slots.push({
          time: slotTime,
          availableStaff,
        })
      }
    }
  }

  return slots
}

/**
 * 予約を取得
 */
export function getBookingById(id: string): Booking | undefined {
  return bookings.find(b => b.id === id)
}

/**
 * 全予約を取得（デバッグ用）
 */
export function getAllBookings(): Booking[] {
  return [...bookings]
}

/**
 * 予約をキャンセル
 */
export function cancelBooking(id: string, token: string): boolean {
  const booking = bookings.find(b => b.id === id && b.cancel_token === token)
  if (booking) {
    booking.status = "cancelled"
    return true
  }
  return false
}
