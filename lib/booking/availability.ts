import { supabase, type Booking, type Staff } from "@/lib/supabase"

/**
 * 指定日の空き枠を取得（Supabaseベース）
 *
 * @param date - 対象日
 * @param durationMinutes - 所要時間（分）
 * @returns 空き枠のリスト
 */
export async function getAvailableSlots(
  date: Date,
  durationMinutes: number = 30
): Promise<
  Array<{
    time: Date
    availableStaff: Array<{ id: string; name: string }>
  }>
> {
  try {
    // 1. アクティブなスタッフを取得
    const { data: staffList, error: staffError } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (staffError) {
      console.error("Failed to fetch staff:", staffError)
      return []
    }

    if (!staffList || staffList.length === 0) {
      console.warn("No active staff found")
      return []
    }

    // 2. 指定日の予約を取得
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)

    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("*")
      .gte("start_time", dayStart.toISOString())
      .lte("start_time", dayEnd.toISOString())
      .in("status", ["confirmed", "completed"])

    if (bookingsError) {
      console.error("Failed to fetch bookings:", bookingsError)
      return []
    }

    // 3. 9:00〜18:00の30分刻みで枠を生成
    const slots: Array<{
      time: Date
      availableStaff: Array<{ id: string; name: string }>
    }> = []

    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = new Date(date)
        slotTime.setHours(hour, minute, 0, 0)
        const slotEnd = new Date(slotTime)
        slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes)

        // この枠で利用可能なスタッフをチェック
        const availableStaff = staffList.filter((staff) => {
          // このスタッフの予約と重複していないかチェック
          const hasConflict = bookings?.some((booking) => {
            if (booking.staff_id !== staff.id) return false

            const bookingStart = new Date(booking.start_time)
            const bookingEnd = new Date(booking.end_time)

            // 時間が重複している場合はtrue
            return (
              (slotTime >= bookingStart && slotTime < bookingEnd) ||
              (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
              (slotTime <= bookingStart && slotEnd >= bookingEnd)
            )
          })

          return !hasConflict
        })

        slots.push({
          time: slotTime,
          availableStaff: availableStaff.map((staff) => ({
            id: staff.id,
            name: staff.name,
          })),
        })
      }
    }

    return slots
  } catch (error) {
    console.error("Error getting available slots:", error)
    return []
  }
}

/**
 * 特定の時間枠が予約可能かチェック
 *
 * @param startTime - 開始時刻
 * @param endTime - 終了時刻
 * @param staffId - スタッフID
 * @returns 予約可能な場合true
 */
export async function isSlotAvailable(
  startTime: Date,
  endTime: Date,
  staffId: string
): Promise<boolean> {
  try {
    const { data: conflictingBookings, error } = await supabase
      .from("bookings")
      .select("id")
      .eq("staff_id", staffId)
      .in("status", ["confirmed", "completed"])
      .or(
        `and(start_time.lte.${endTime.toISOString()},end_time.gte.${startTime.toISOString()})`
      )
      .limit(1)

    if (error) {
      console.error("Failed to check slot availability:", error)
      return false
    }

    return !conflictingBookings || conflictingBookings.length === 0
  } catch (error) {
    console.error("Error checking slot availability:", error)
    return false
  }
}

/**
 * スタッフの指定期間の予約を取得
 *
 * @param staffId - スタッフID
 * @param startDate - 開始日
 * @param endDate - 終了日
 * @returns 予約のリスト
 */
export async function getStaffBookings(
  staffId: string,
  startDate: Date,
  endDate: Date
): Promise<Booking[]> {
  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", staffId)
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Failed to fetch staff bookings:", error)
      return []
    }

    return (bookings as Booking[]) || []
  } catch (error) {
    console.error("Error getting staff bookings:", error)
    return []
  }
}
