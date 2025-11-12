-- ============================================
-- このSQLをSupabaseで実行してください
-- ============================================
--
-- 実行手順:
-- 1. https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new を開く
-- 2. このファイル全体をコピー&ペースト
-- 3. 右上の「Run」ボタンをクリック
-- 4. 「Success」と表示されたら完了！
--
-- ============================================

-- 1. スタッフテーブル
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6EC5FF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 相談種別テーブル
CREATE TABLE IF NOT EXISTS consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 予約テーブル
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'confirmed',
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  staff_id UUID NOT NULL REFERENCES staff(id),
  consultation_type_id UUID NOT NULL REFERENCES consultation_types(id),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  client_memo TEXT,
  is_recent BOOLEAN NOT NULL DEFAULT false,
  google_event_id TEXT,
  google_meet_link TEXT,
  cancel_token TEXT NOT NULL UNIQUE,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer_url TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- 4. メール送信ログテーブル
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type TEXT NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  to_email TEXT NOT NULL,
  to_name TEXT,
  from_email TEXT NOT NULL DEFAULT 'TIMREXPLUS <onboarding@resend.dev>',
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,
  resend_id TEXT,
  resend_status TEXT,
  resend_error TEXT,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_consultation_types_display_order ON consultation_types(display_order);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_client_email ON bookings(client_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_booking_id ON email_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_is_sent ON email_logs(is_sent);

-- 初期データ投入
INSERT INTO staff (name, email, color) VALUES
  ('担当者A', 'staff-a@zettai.co.jp', '#6EC5FF'),
  ('担当者B', 'staff-b@zettai.co.jp', '#FFC870')
ON CONFLICT (email) DO NOTHING;

INSERT INTO consultation_types (name, duration_minutes, display_order) VALUES
  ('商材1 - ベーシック相談', 30, 1),
  ('商材2 - プレミアム相談', 60, 2),
  ('商材3 - エンタープライズ相談', 45, 3),
  ('商材4 - コンサルティング', 90, 4),
  ('商材5 - サポート相談', 30, 5),
  ('商材6 - カスタム相談', 60, 6)
ON CONFLICT DO NOTHING;

-- 完了確認
SELECT 'テーブル作成完了！' AS message;
SELECT COUNT(*) AS staff_count FROM staff;
SELECT COUNT(*) AS consultation_types_count FROM consultation_types;
