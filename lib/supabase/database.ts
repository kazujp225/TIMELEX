import { supabase, supabaseAdmin } from "./client"
import { encryptFields, decryptFields } from "@/lib/encryption"
import type {
  Staff,
  ConsultationType,
  InquirySource,
  Booking,
  BookingWithRelations,
  StaffWorkingHours,
  StaffVacation,
} from "@/types"

// 暗号化対象フィールド
const ENCRYPTED_BOOKING_FIELDS = ["client_name", "client_email", "client_company", "client_memo"] as const

// ==========================================
// スタッフ操作
// ==========================================
export const staffDb = {
  /**
   * 全スタッフを取得（アクティブのみ）
   */
  async getActiveStaff(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("name")

    if (error) throw error
    return data as Staff[]
  },

  /**
   * スタッフをIDで取得
   */
  async getById(id: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as Staff
  },

  /**
   * メールアドレスでスタッフを取得
   */
  async getByEmail(email: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }
    return data as Staff
  },
}

// ==========================================
// 相談種別操作
// ==========================================
export const consultationTypeDb = {
  /**
   * 全相談種別を取得（アクティブのみ、表示順）
   */
  async getActive(): Promise<ConsultationType[]> {
    const { data, error } = await supabase
      .from("consultation_types")
      .select("*")
      .eq("is_active", true)
      .order("display_order")

    if (error) throw error
    return data as ConsultationType[]
  },

  /**
   * 相談種別をIDで取得
   */
  async getById(id: string): Promise<ConsultationType | null> {
    const { data, error } = await supabase
      .from("consultation_types")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return data as ConsultationType
  },
}

// ==========================================
// お問い合わせ元操作
// ==========================================
export const inquirySourceDb = {
  /**
   * 全お問い合わせ元を取得（アクティブのみ、表示順）
   */
  async getActive(): Promise<InquirySource[]> {
    const { data, error } = await supabase
      .from("inquiry_sources")
      .select("*")
      .eq("is_active", true)
      .order("display_order")

    if (error) throw error
    return data as InquirySource[]
  },
}

// ==========================================
// 予約操作
// ==========================================
export const bookingDb = {
  /**
   * 予約を作成
   */
  async create(booking: Omit<Booking, "id" | "created_at" | "updated_at" | "cancelled_at">): Promise<Booking> {
    // PII（個人情報）を暗号化
    const encryptedBooking = encryptFields(booking, [...ENCRYPTED_BOOKING_FIELDS])

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .insert(encryptedBooking)
      .select()
      .single()

    if (error) throw error

    // 復号化して返す
    return decryptFields(data as Booking, [...ENCRYPTED_BOOKING_FIELDS])
  },

  /**
   * 予約をIDで取得（リレーション含む）
   */
  async getById(id: string): Promise<BookingWithRelations | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        staff(*),
        consultation_type:consultation_types(*),
        inquiry_source:inquiry_sources(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    // 暗号化されたフィールドを復号化
    const booking = data as unknown as BookingWithRelations
    return decryptFields(booking, [...ENCRYPTED_BOOKING_FIELDS]) as BookingWithRelations
  },

  /**
   * キャンセルトークンで予約を取得
   */
  async getByCancelToken(token: string): Promise<BookingWithRelations | null> {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        staff(*),
        consultation_type:consultation_types(*),
        inquiry_source:inquiry_sources(*)
      `)
      .eq("cancel_token", token)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    // 暗号化されたフィールドを復号化
    const booking = data as unknown as BookingWithRelations
    return decryptFields(booking, [...ENCRYPTED_BOOKING_FIELDS]) as BookingWithRelations
  },

  /**
   * 予約をキャンセル
   */
  async cancel(id: string): Promise<Booking> {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data as Booking
  },

  /**
   * スタッフの予約一覧を取得（日付範囲指定）
   */
  async getByStaffAndDateRange(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Booking[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("staff_id", staffId)
      .eq("status", "confirmed")
      .gte("start_time", startDate.toISOString())
      .lte("start_time", endDate.toISOString())
      .order("start_time")

    if (error) throw error
    return data as Booking[]
  },

  /**
   * メールアドレスで過去の予約を検索（Recent判定用）
   */
  async getRecentByEmail(email: string, days: number): Promise<Booking[]> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("client_email", email.toLowerCase())
      .eq("status", "confirmed")
      .gte("start_time", cutoffDate.toISOString())
      .order("start_time", { ascending: false })
      .limit(1)

    if (error) throw error
    return data as Booking[]
  },
}

// ==========================================
// 稼働時間操作
// ==========================================
export const workingHoursDb = {
  /**
   * スタッフの稼働時間を取得
   */
  async getByStaff(staffId: string): Promise<StaffWorkingHours[]> {
    const { data, error } = await supabase
      .from("staff_working_hours")
      .select("*")
      .eq("staff_id", staffId)
      .eq("is_active", true)
      .order("day_of_week")
      .order("start_time")

    if (error) throw error
    return data as StaffWorkingHours[]
  },
}

// ==========================================
// 休暇操作
// ==========================================
export const vacationDb = {
  /**
   * スタッフの休暇を取得（日付範囲指定）
   */
  async getByStaffAndDateRange(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StaffVacation[]> {
    const { data, error } = await supabase
      .from("staff_vacations")
      .select("*")
      .eq("staff_id", staffId)
      .gte("vacation_date", startDate.toISOString().split("T")[0])
      .lte("vacation_date", endDate.toISOString().split("T")[0])

    if (error) throw error
    return data as StaffVacation[]
  },
}

// ==========================================
// グローバル設定操作
// ==========================================
export const settingsDb = {
  /**
   * 設定値を取得
   */
  async get(key: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("global_settings")
      .select("value")
      .eq("key", key)
      .single()

    if (error) throw error
    return data.value
  },

  /**
   * 全設定を取得
   */
  async getAll(): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("global_settings")
      .select("key, value")

    if (error) throw error

    return data.reduce((acc, { key, value }) => {
      acc[key] = value
      return acc
    }, {} as Record<string, unknown>)
  },
}
