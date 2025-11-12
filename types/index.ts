// ==========================================
// TIMREXPLUS型定義
// ==========================================

// ==========================================
// Enums
// ==========================================
export enum BookingStatus {
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

export enum ConsultationMode {
  IMMEDIATE = "immediate",
  MANUAL = "manual",
}

export enum RecentModeOverride {
  KEEP = "keep",
  SWITCH_TO_MANUAL = "switch_to_manual",
}

export enum ActorType {
  CLIENT = "client",
  STAFF = "staff",
  SYSTEM = "system",
}

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  CANCEL = "cancel",
  VIEW = "view",
}

export enum VacationType {
  FULL_DAY = "full_day",
  MORNING = "morning",
  AFTERNOON = "afternoon",
}

// ==========================================
// スタッフ
// ==========================================
export interface Staff {
  id: string
  name: string
  email: string
  photo_url?: string | null
  is_active: boolean
  google_refresh_token?: string | null
  google_token_expires_at?: Date | null
  timezone: string
  created_at: Date
  updated_at: Date
}

export interface StaffCreateInput {
  name: string
  email: string
  photo_url?: string
  timezone?: string
}

export interface StaffUpdateInput {
  name?: string
  email?: string
  photo_url?: string | null
  is_active?: boolean
  timezone?: string
}

// ==========================================
// 相談種別
// ==========================================
export interface ConsultationType {
  id: string
  name: string
  duration_minutes: number
  buffer_before_minutes: number
  buffer_after_minutes: number
  mode: ConsultationMode
  recent_mode_override: RecentModeOverride
  display_order: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface ConsultationTypeCreateInput {
  name: string
  duration_minutes: number
  buffer_before_minutes?: number
  buffer_after_minutes?: number
  mode?: ConsultationMode
  recent_mode_override?: RecentModeOverride
  display_order?: number
}

// ==========================================
// お問い合わせ元
// ==========================================
export interface InquirySource {
  id: string
  name: string
  display_order: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface InquirySourceCreateInput {
  name: string
  display_order?: number
}

// ==========================================
// 予約
// ==========================================
export interface Booking {
  id: string
  status: BookingStatus
  start_time: Date
  end_time: Date
  duration_minutes: number
  staff_id: string
  consultation_type_id: string
  inquiry_source_id: string

  // クライアント情報
  client_name: string
  client_email: string
  client_company?: string | null
  client_memo?: string | null

  is_recent: boolean

  // Google連携
  google_event_id: string
  google_meet_link: string

  // キャンセルトークン
  cancel_token: string

  // UTM/追跡
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  utm_content?: string | null
  utm_term?: string | null
  referrer_url?: string | null
  ip_address?: string | null
  user_agent?: string | null

  created_at: Date
  updated_at: Date
  cancelled_at?: Date | null
}

export interface BookingWithRelations extends Booking {
  staff: Staff
  consultation_type: ConsultationType
  inquiry_source: InquirySource
}

export interface BookingCreateInput {
  start_time: Date
  end_time: Date
  duration_minutes: number
  staff_id: string
  consultation_type_id: string
  inquiry_source_id: string
  client_name: string
  client_email: string
  client_company?: string
  client_memo?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer_url?: string
  ip_address?: string
  user_agent?: string
}

// ==========================================
// 稼働時間
// ==========================================
export interface StaffWorkingHours {
  id: string
  staff_id: string
  day_of_week: number // 0=日曜, 6=土曜
  start_time: string // "09:00"形式
  end_time: string // "18:00"形式
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// ==========================================
// 休暇
// ==========================================
export interface StaffVacation {
  id: string
  staff_id: string
  vacation_date: Date
  vacation_type: VacationType
  created_at: Date
  updated_at: Date
}

// ==========================================
// 監査ログ
// ==========================================
export interface AuditLog {
  id: string
  actor_type: ActorType
  actor_identifier: string
  action: AuditAction
  target_booking_id?: string | null
  ip_address?: string | null
  user_agent?: string | null
  state_before?: Record<string, unknown> | null
  state_after?: Record<string, unknown> | null
  created_at: Date
}

// ==========================================
// グローバル設定
// ==========================================
export interface GlobalSetting {
  id: string
  key: string
  value: unknown
  description?: string | null
  created_at: Date
  updated_at: Date
}

export interface GlobalSettings {
  min_booking_notice_hours: number
  max_booking_days: number
  recent_customer_days: number
  data_retention_days: number
  change_cancel_deadline_hours: number
}

// ==========================================
// 空き枠
// ==========================================
export interface AvailableSlot {
  start_time: Date
  end_time: Date
  staff_id: string
  staff_name: string
}

// ==========================================
// API リクエスト/レスポンス
// ==========================================
export interface BookingFormData {
  date: string
  time: string
  consultation_type_id: string
  inquiry_source_id: string
  client_name: string
  client_email: string
  client_company?: string
  client_memo?: string
}

export interface BookingConfirmationResponse {
  booking: BookingWithRelations
  google_meet_link: string
  cancel_url: string
}

export interface AvailableSlotsRequest {
  consultation_type_id: string
  start_date?: string
  end_date?: string
}

export interface AvailableSlotsResponse {
  slots: AvailableSlot[]
}

// ==========================================
// 事前アンケート
// ==========================================
export enum QuestionType {
  TEXT = "text",
  TEXTAREA = "textarea",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  SELECT = "select",
}

export interface Questionnaire {
  id: string
  name: string
  description?: string | null
  consultation_type_id?: string | null
  is_active: boolean
  display_order: number
  created_at: Date
  updated_at: Date
}

export interface Question {
  id: string
  questionnaire_id: string
  question_text: string
  question_type: QuestionType
  options?: string[] | null
  is_required: boolean
  display_order: number
  placeholder?: string | null
  help_text?: string | null
  created_at: Date
  updated_at: Date
}

export interface BookingAnswer {
  id: string
  booking_id: string
  question_id: string
  answer_text?: string | null
  answer_json?: string[] | null
  created_at: Date
  updated_at: Date
}

export interface QuestionWithAnswer extends Question {
  answer?: BookingAnswer
}

export interface QuestionnaireWithQuestions extends Questionnaire {
  questions: Question[]
}

export interface QuestionnaireCreateInput {
  name: string
  description?: string
  consultation_type_id?: string
  display_order?: number
}

export interface QuestionCreateInput {
  questionnaire_id: string
  question_text: string
  question_type: QuestionType
  options?: string[]
  is_required?: boolean
  display_order?: number
  placeholder?: string
  help_text?: string
}

export interface BookingAnswerInput {
  question_id: string
  answer_text?: string
  answer_json?: string[]
}
