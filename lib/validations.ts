import { z } from "zod"

// ==========================================
// 予約フォームのバリデーション
// ==========================================
export const bookingFormSchema = z.object({
  // 日時選択
  start_time: z.date({
    required_error: "日時を選択してください",
  }),
  consultation_type_id: z.string({
    required_error: "相談種別を選択してください",
  }).uuid("無効な相談種別IDです"),

  // クライアント情報
  client_name: z.string({
    required_error: "お名前を入力してください",
  })
    .min(1, "お名前を入力してください")
    .max(50, "お名前は50文字以内で入力してください"),

  client_email: z.string({
    required_error: "メールアドレスを入力してください",
  })
    .email("正しいメールアドレスを入力してください")
    .max(100, "メールアドレスは100文字以内で入力してください")
    .transform(val => val.toLowerCase()),

  inquiry_source_id: z.string({
    required_error: "お問い合わせ元を選択してください",
  }).uuid("無効なお問い合わせ元IDです"),

  // 任意項目
  client_company: z.string()
    .max(100, "会社名は100文字以内で入力してください")
    .optional(),

  client_memo: z.string()
    .max(500, "メモは500文字以内で入力してください")
    .optional(),

  // UTM/追跡情報（自動取得）
  utm_source: z.string().max(100).optional(),
  utm_medium: z.string().max(100).optional(),
  utm_campaign: z.string().max(100).optional(),
  utm_content: z.string().max(100).optional(),
  utm_term: z.string().max(100).optional(),
  referrer_url: z.string().max(500).optional(),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

// ==========================================
// スタッフ作成のバリデーション
// ==========================================
export const staffCreateSchema = z.object({
  name: z.string()
    .min(1, "名前を入力してください")
    .max(50, "名前は50文字以内で入力してください"),

  email: z.string()
    .email("正しいメールアドレスを入力してください")
    .max(100, "メールアドレスは100文字以内で入力してください")
    .transform(val => val.toLowerCase()),

  photo_url: z.string().url("正しいURLを入力してください").optional(),

  timezone: z.string().default("Asia/Tokyo"),
})

export type StaffCreateData = z.infer<typeof staffCreateSchema>

// ==========================================
// 相談種別作成のバリデーション
// ==========================================
export const consultationTypeCreateSchema = z.object({
  name: z.string()
    .min(1, "相談種別名を入力してください")
    .max(50, "相談種別名は50文字以内で入力してください"),

  duration_minutes: z.number()
    .int("整数で入力してください")
    .min(15, "所要時間は15分以上で設定してください")
    .max(180, "所要時間は180分以内で設定してください"),

  buffer_before_minutes: z.number()
    .int("整数で入力してください")
    .min(0, "バッファは0分以上で設定してください")
    .max(30, "バッファは30分以内で設定してください")
    .default(5),

  buffer_after_minutes: z.number()
    .int("整数で入力してください")
    .min(0, "バッファは0分以上で設定してください")
    .max(30, "バッファは30分以内で設定してください")
    .default(5),

  mode: z.enum(["immediate", "manual"]).default("immediate"),

  recent_mode_override: z.enum(["keep", "switch_to_manual"]).default("keep"),

  display_order: z.number().int().default(0),
})

export type ConsultationTypeCreateData = z.infer<typeof consultationTypeCreateSchema>

// ==========================================
// お問い合わせ元作成のバリデーション
// ==========================================
export const inquirySourceCreateSchema = z.object({
  name: z.string()
    .min(1, "お問い合わせ元名を入力してください")
    .max(50, "お問い合わせ元名は50文字以内で入力してください"),

  display_order: z.number().int().default(0),
})

export type InquirySourceCreateData = z.infer<typeof inquirySourceCreateSchema>

// ==========================================
// 稼働時間のバリデーション
// ==========================================
export const workingHoursSchema = z.object({
  staff_id: z.string().uuid(),
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM形式で入力してください"),
  end_time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "HH:MM形式で入力してください"),
}).refine(data => {
  const start = data.start_time.split(":").map(Number)
  const end = data.end_time.split(":").map(Number)
  const startMinutes = start[0] * 60 + start[1]
  const endMinutes = end[0] * 60 + end[1]
  return startMinutes < endMinutes
}, {
  message: "終了時刻は開始時刻より後にしてください",
  path: ["end_time"],
})

export type WorkingHoursData = z.infer<typeof workingHoursSchema>

// ==========================================
// 休暇のバリデーション
// ==========================================
export const vacationSchema = z.object({
  staff_id: z.string().uuid(),
  vacation_date: z.date(),
  vacation_type: z.enum(["full_day", "morning", "afternoon"]).default("full_day"),
})

export type VacationData = z.infer<typeof vacationSchema>

// ==========================================
// キャンセルリクエストのバリデーション
// ==========================================
export const cancelBookingSchema = z.object({
  booking_id: z.string().uuid(),
  cancel_token: z.string().length(64, "無効なキャンセルトークンです"),
})

export type CancelBookingData = z.infer<typeof cancelBookingSchema>
