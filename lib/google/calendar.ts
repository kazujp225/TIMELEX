import { google } from "googleapis"
import { supabaseAdmin } from "@/lib/supabase/client"

/**
 * スタッフのGoogle Calendar認証クライアントを取得
 */
export async function getCalendarClient(staffId: string) {
  // スタッフのリフレッシュトークンを取得
  const { data: staff } = await supabaseAdmin
    .from("staff")
    .select("google_refresh_token, email")
    .eq("id", staffId)
    .single()

  if (!staff || !staff.google_refresh_token) {
    throw new Error("Staff not found or Google Calendar not connected")
  }

  // OAuth2クライアントを作成
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )

  // リフレッシュトークンを設定
  oauth2Client.setCredentials({
    refresh_token: staff.google_refresh_token,
  })

  // Calendar APIクライアントを作成
  const calendar = google.calendar({ version: "v3", auth: oauth2Client })

  return { calendar, oauth2Client, staffEmail: staff.email }
}

/**
 * スタッフの空き時間を取得（FreeBusy API）
 */
export async function getFreeBusy(
  staffId: string,
  timeMin: Date,
  timeMax: Date
) {
  const { calendar, staffEmail } = await getCalendarClient(staffId)

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      items: [{ id: staffEmail }],
    },
  })

  const busySlots = response.data.calendars?.[staffEmail]?.busy || []
  return busySlots.map((slot) => ({
    start: new Date(slot.start!),
    end: new Date(slot.end!),
  }))
}

/**
 * Google Calendarにイベントを作成（Google Meet付き）
 */
export async function createCalendarEvent(
  staffId: string,
  event: {
    summary: string
    description: string
    start: Date
    end: Date
    attendees: Array<{ email: string; displayName?: string }>
  }
) {
  const { calendar } = await getCalendarClient(staffId)

  const response = await calendar.events.insert({
    calendarId: "primary",
    conferenceDataVersion: 1,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: "Asia/Tokyo",
      },
      attendees: event.attendees,
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1日前
          { method: "popup", minutes: 30 }, // 30分前
        ],
      },
    },
  })

  const meetLink =
    response.data.conferenceData?.entryPoints?.find(
      (entry) => entry.entryPointType === "video"
    )?.uri || ""

  return {
    eventId: response.data.id!,
    meetLink,
    htmlLink: response.data.htmlLink!,
  }
}

/**
 * Google Calendarのイベントを更新
 */
export async function updateCalendarEvent(
  staffId: string,
  eventId: string,
  updates: {
    summary?: string
    description?: string
    start?: Date
    end?: Date
  }
) {
  const { calendar } = await getCalendarClient(staffId)

  const requestBody: any = {}

  if (updates.summary) requestBody.summary = updates.summary
  if (updates.description) requestBody.description = updates.description
  if (updates.start) {
    requestBody.start = {
      dateTime: updates.start.toISOString(),
      timeZone: "Asia/Tokyo",
    }
  }
  if (updates.end) {
    requestBody.end = {
      dateTime: updates.end.toISOString(),
      timeZone: "Asia/Tokyo",
    }
  }

  await calendar.events.patch({
    calendarId: "primary",
    eventId,
    requestBody,
  })
}

/**
 * Google Calendarのイベントを削除
 */
export async function deleteCalendarEvent(staffId: string, eventId: string) {
  const { calendar } = await getCalendarClient(staffId)

  await calendar.events.delete({
    calendarId: "primary",
    eventId,
  })
}

/**
 * スタッフの稼働時間内で空き枠を計算
 */
export async function calculateAvailableSlots(
  staffId: string,
  consultationTypeId: string,
  startDate: Date,
  endDate: Date
) {
  // 相談種別を取得
  const { data: consultationType } = await supabaseAdmin
    .from("consultation_types")
    .select("*")
    .eq("id", consultationTypeId)
    .single()

  if (!consultationType) {
    throw new Error("Consultation type not found")
  }

  const duration = consultationType.duration_minutes
  const bufferBefore = consultationType.buffer_before_minutes
  const bufferAfter = consultationType.buffer_after_minutes
  const totalDuration = duration + bufferBefore + bufferAfter

  // スタッフの稼働時間を取得
  const { data: workingHours } = await supabaseAdmin
    .from("staff_working_hours")
    .select("*")
    .eq("staff_id", staffId)
    .eq("is_active", true)

  // スタッフの休暇を取得
  const { data: vacations } = await supabaseAdmin
    .from("staff_vacations")
    .select("*")
    .eq("staff_id", staffId)
    .gte("vacation_date", startDate.toISOString().split("T")[0])
    .lte("vacation_date", endDate.toISOString().split("T")[0])

  const vacationDates = new Set(
    vacations?.map((v) => v.vacation_date) || []
  )

  // Google Calendarの予定を取得
  const busySlots = await getFreeBusy(staffId, startDate, endDate)

  // 既存の予約を取得
  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("start_time, end_time")
    .eq("staff_id", staffId)
    .eq("status", "confirmed")
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())

  // 空き枠を計算
  const availableSlots: Array<{ start: Date; end: Date }> = []
  const current = new Date(startDate)

  while (current < endDate) {
    const dayOfWeek = current.getDay()
    const dateStr = current.toISOString().split("T")[0]

    // 休暇チェック
    if (vacationDates.has(dateStr)) {
      current.setDate(current.getDate() + 1)
      current.setHours(0, 0, 0, 0)
      continue
    }

    // その日の稼働時間を取得
    const dayWorkingHours = workingHours?.filter(
      (wh) => wh.day_of_week === dayOfWeek
    )

    if (!dayWorkingHours || dayWorkingHours.length === 0) {
      current.setDate(current.getDate() + 1)
      current.setHours(0, 0, 0, 0)
      continue
    }

    // 各稼働時間帯で空き枠をチェック
    for (const wh of dayWorkingHours) {
      const [startHour, startMinute] = wh.start_time.split(":").map(Number)
      const [endHour, endMinute] = wh.end_time.split(":").map(Number)

      const slotStart = new Date(current)
      slotStart.setHours(startHour, startMinute, 0, 0)

      const workEnd = new Date(current)
      workEnd.setHours(endHour, endMinute, 0, 0)

      // 30分間隔でチェック
      while (slotStart.getTime() + totalDuration * 60 * 1000 <= workEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + totalDuration * 60 * 1000)

        // 最短予約猶予をチェック
        const now = new Date()
        const minBookingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // デフォルト2時間

        if (slotStart < minBookingTime) {
          slotStart.setMinutes(slotStart.getMinutes() + 30)
          continue
        }

        // 予定との重複チェック
        let isAvailable = true

        // Google Calendar
        for (const busy of busySlots) {
          if (
            (slotStart >= busy.start && slotStart < busy.end) ||
            (slotEnd > busy.start && slotEnd <= busy.end) ||
            (slotStart <= busy.start && slotEnd >= busy.end)
          ) {
            isAvailable = false
            break
          }
        }

        // 既存予約
        if (isAvailable && bookings) {
          for (const booking of bookings) {
            const bStart = new Date(booking.start_time)
            const bEnd = new Date(booking.end_time)

            if (
              (slotStart >= bStart && slotStart < bEnd) ||
              (slotEnd > bStart && slotEnd <= bEnd) ||
              (slotStart <= bStart && slotEnd >= bEnd)
            ) {
              isAvailable = false
              break
            }
          }
        }

        if (isAvailable) {
          // バッファを除いた実際の予約時間を返す
          const actualStart = new Date(slotStart.getTime() + bufferBefore * 60 * 1000)
          const actualEnd = new Date(actualStart.getTime() + duration * 60 * 1000)

          availableSlots.push({
            start: actualStart,
            end: actualEnd,
          })
        }

        slotStart.setMinutes(slotStart.getMinutes() + 30)
      }
    }

    current.setDate(current.getDate() + 1)
    current.setHours(0, 0, 0, 0)
  }

  return availableSlots
}
