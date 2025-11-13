/**
 * Google Calendar API 簡易版（Supabase不使用）
 *
 * 使用方法:
 * 1. Google Cloud Consoleでサービスアカウントを作成
 * 2. カレンダーをサービスアカウントと共有
 * 3. 環境変数にサービスアカウントキーを設定
 */

import { google } from "googleapis"

/**
 * Google Calendar APIクライアントを取得
 */
function getCalendarClient() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  if (!credentials) {
    console.warn("⚠️ GOOGLE_SERVICE_ACCOUNT_KEY not set, using mock data")
    return null
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(credentials),
      scopes: ["https://www.googleapis.com/auth/calendar"],
    })

    return google.calendar({ version: "v3", auth })
  } catch (error) {
    console.error("Failed to initialize Google Calendar client:", error)
    return null
  }
}

/**
 * 空き枠を取得（実際のカレンダーAPIまたはモック）
 */
export async function getAvailableSlots(
  date: Date,
  duration: number = 30,
  calendarIds: string[] = []
): Promise<Array<{ time: Date; available: boolean }>> {
  const calendar = getCalendarClient()

  // カレンダーIDが設定されていない場合は環境変数から取得
  const targetCalendarIds = calendarIds.length > 0
    ? calendarIds
    : (process.env.GOOGLE_CALENDAR_IDS || "").split(",").filter(Boolean)

  if (!calendar || targetCalendarIds.length === 0) {
    console.log("📅 Using mock calendar data (no API connection)")
    return getMockAvailableSlots(date, duration)
  }

  try {
    // 指定日の開始・終了時刻を設定（9:00-18:00）
    const dayStart = new Date(date)
    dayStart.setHours(9, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(18, 0, 0, 0)

    // 全カレンダーのビジー期間を取得
    const busyPeriods = await checkFreeBusy(
      targetCalendarIds.join(","),
      dayStart,
      dayEnd
    )

    // 30分刻みで枠を生成し、ビジー期間と照合
    const slots: Array<{ time: Date; available: boolean }> = []

    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const slotTime = new Date(date)
        slotTime.setHours(hour, minute, 0, 0)
        const slotEnd = new Date(slotTime)
        slotEnd.setMinutes(slotEnd.getMinutes() + duration)

        // この枠がビジー期間と重なっていないかチェック
        const isAvailable = !busyPeriods.some(busy =>
          (slotTime >= busy.start && slotTime < busy.end) ||
          (slotEnd > busy.start && slotEnd <= busy.end) ||
          (slotTime <= busy.start && slotEnd >= busy.end)
        )

        slots.push({ time: slotTime, available: isAvailable })
      }
    }

    return slots
  } catch (error) {
    console.error("Error fetching calendar availability:", error)
    return getMockAvailableSlots(date, duration)
  }
}

/**
 * モックデータを生成（API接続なしの場合）
 */
function getMockAvailableSlots(
  date: Date,
  duration: number = 30
): Array<{ time: Date; available: boolean }> {
  const slots: Array<{ time: Date; available: boolean }> = []

  // 9:00 - 18:00の30分刻みで枠を生成
  for (let hour = 9; hour < 18; hour++) {
    for (const minute of [0, 30]) {
      const slotTime = new Date(date)
      slotTime.setHours(hour, minute, 0, 0)

      // ランダムに空き状況を生成（70%の確率で空き）
      const available = Math.random() > 0.3

      slots.push({ time: slotTime, available })
    }
  }

  return slots
}

/**
 * Google Calendar APIで空き時間を確認
 *
 * @param calendarIds - カレンダーID（カンマ区切り）
 * @param timeMin - 開始時刻
 * @param timeMax - 終了時刻
 * @returns busy periods
 */
export async function checkFreeBusy(
  calendarIds: string,
  timeMin: Date,
  timeMax: Date
): Promise<Array<{ start: Date; end: Date }>> {
  const calendar = getCalendarClient()

  if (!calendar) {
    console.log("📅 Using mock busy periods (no API connection)")
    return getMockBusyPeriods(timeMin, timeMax)
  }

  try {
    const calendarIdList = calendarIds.split(",").filter(Boolean)

    console.log(`📅 Checking calendar availability for ${calendarIdList.length} calendar(s)`)
    console.log(`   Time range: ${timeMin.toISOString()} - ${timeMax.toISOString()}`)

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: calendarIdList.map(id => ({ id: id.trim() })),
      },
    })

    // すべてのカレンダーのビジー期間を集約
    const busyPeriods: Array<{ start: Date; end: Date }> = []

    if (response.data.calendars) {
      for (const calendarId of calendarIdList) {
        const calendarData = response.data.calendars[calendarId.trim()]
        if (calendarData?.busy) {
          for (const busy of calendarData.busy) {
            if (busy.start && busy.end) {
              busyPeriods.push({
                start: new Date(busy.start),
                end: new Date(busy.end),
              })
            }
          }
        }
      }
    }

    console.log(`   Found ${busyPeriods.length} busy period(s)`)
    return busyPeriods
  } catch (error) {
    console.error("Error checking calendar availability:", error)
    return getMockBusyPeriods(timeMin, timeMax)
  }
}

/**
 * モックのビジー期間を生成（API接続なしの場合）
 */
function getMockBusyPeriods(
  timeMin: Date,
  timeMax: Date
): Array<{ start: Date; end: Date }> {
  const busyPeriods: Array<{ start: Date; end: Date }> = []

  // 10:00-11:00 がビジー（例）
  const busy1Start = new Date(timeMin)
  busy1Start.setHours(10, 0, 0, 0)
  const busy1End = new Date(busy1Start)
  busy1End.setHours(11, 0, 0, 0)

  if (busy1Start >= timeMin && busy1End <= timeMax) {
    busyPeriods.push({ start: busy1Start, end: busy1End })
  }

  // 14:30-15:00 がビジー（例）
  const busy2Start = new Date(timeMin)
  busy2Start.setHours(14, 30, 0, 0)
  const busy2End = new Date(busy2Start)
  busy2End.setHours(15, 0, 0, 0)

  if (busy2Start >= timeMin && busy2End <= timeMax) {
    busyPeriods.push({ start: busy2Start, end: busy2End })
  }

  return busyPeriods
}

/**
 * Google Calendarにイベントを作成
 *
 * @param calendarId - カレンダーID
 * @param event - イベント情報
 * @returns イベントID
 */
export async function createCalendarEvent(
  calendarId: string,
  event: {
    summary: string
    description?: string
    start: Date
    end: Date
    attendees?: Array<{ email: string }>
  }
): Promise<{ eventId: string; meetLink?: string }> {
  const calendar = getCalendarClient()

  if (!calendar) {
    console.log("📅 Using mock event creation (no API connection)")
    const eventId = `mock-event-${Date.now()}`
    const meetLink = `https://meet.google.com/xxx-yyyy-zzz`
    return { eventId, meetLink }
  }

  try {
    console.log(`📅 Creating calendar event for ${calendarId}`)
    console.log(`   Event: ${event.summary}`)
    console.log(`   Time: ${event.start.toISOString()} - ${event.end.toISOString()}`)

    const response = await calendar.events.insert({
      calendarId,
      conferenceDataVersion: 1, // Google Meet生成を有効化
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
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    })

    const eventId = response.data.id || `event-${Date.now()}`
    const meetLink = response.data.hangoutLink || response.data.conferenceData?.entryPoints?.[0]?.uri

    console.log(`   ✅ Event created: ${eventId}`)
    if (meetLink) {
      console.log(`   🎥 Meet link: ${meetLink}`)
    }

    return { eventId, meetLink }
  } catch (error) {
    console.error("Error creating calendar event:", error)
    // エラー時もモックを返す
    const eventId = `fallback-event-${Date.now()}`
    return { eventId }
  }
}
