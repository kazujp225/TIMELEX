import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Supabase URL is missing")
}

/**
 * Supabaseクライアント（サーバーサイド用）
 * Service Role Keyを使用するため、セキュリティ上サーバーサイドのみで使用
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/**
 * データベース型定義
 */
export interface Staff {
  id: string
  name: string
  email: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ConsultationType {
  id: string
  name: string
  duration_minutes: number
  description?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  status: "confirmed" | "cancelled" | "completed" | "no_show"
  start_time: string
  end_time: string
  duration_minutes: number
  staff_id: string
  consultation_type_id: string
  client_name: string
  client_email: string
  client_company?: string
  client_memo?: string
  is_recent: boolean
  google_event_id?: string
  google_meet_link?: string
  cancel_token: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer_url?: string
  ip_address?: string
  user_agent?: string
  created_at: string
  updated_at: string
  cancelled_at?: string
}

export interface EmailLog {
  id: string
  email_type: string
  booking_id?: string
  to_email: string
  to_name?: string
  from_email: string
  subject: string
  body_html?: string
  body_text?: string
  resend_id?: string
  resend_status?: string
  resend_error?: string
  is_sent: boolean
  sent_at?: string
  failed_at?: string
  retry_count: number
  created_at: string
}
