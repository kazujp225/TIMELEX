-- ============================================
-- TIMREXPLUS データベーススキーマ（Resend統合版）
-- ============================================
-- 実行手順:
-- 1. Supabaseダッシュボード → SQL Editor
-- 2. 「New query」をクリック
-- 3. このファイルの内容をコピー&ペースト
-- 4. 「Run」をクリック
-- ============================================

-- 既存テーブルの削除（開発環境のみ）
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS consultation_types CASCADE;

-- ============================================
-- 1. スタッフ（担当者）テーブル
-- ============================================
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6EC5FF',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_is_active ON staff(is_active);

COMMENT ON TABLE staff IS '担当者マスタ';
COMMENT ON COLUMN staff.color IS 'カレンダー表示用カラーコード';

-- ============================================
-- 2. 相談種別（商材）テーブル
-- ============================================
CREATE TABLE consultation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultation_types_is_active ON consultation_types(is_active);
CREATE INDEX idx_consultation_types_display_order ON consultation_types(display_order);

COMMENT ON TABLE consultation_types IS '相談種別（商材）マスタ';
COMMENT ON COLUMN consultation_types.duration_minutes IS '相談時間（分）';

-- ============================================
-- 3. 予約テーブル
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 予約ステータス
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),

  -- 日時情報
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,

  -- 関連情報（外部キー）
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  consultation_type_id UUID NOT NULL REFERENCES consultation_types(id) ON DELETE CASCADE,

  -- クライアント情報
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  client_memo TEXT,

  -- 継続顧客フラグ（30日以内の再予約）
  is_recent BOOLEAN NOT NULL DEFAULT false,

  -- Google Calendar連携（今後の拡張用）
  google_event_id TEXT,
  google_meet_link TEXT,

  -- キャンセル用トークン（URL生成用）
  cancel_token TEXT NOT NULL UNIQUE,

  -- マーケティング追跡（UTMパラメータ）
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  referrer_url TEXT,

  -- アクセス情報
  ip_address TEXT,
  user_agent TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

-- 予約テーブルのインデックス
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_consultation_type_id ON bookings(consultation_type_id);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_bookings_cancel_token ON bookings(cancel_token);
CREATE INDEX idx_bookings_is_recent ON bookings(is_recent);

-- 予約の時間範囲検索用の複合インデックス
CREATE INDEX idx_bookings_staff_time ON bookings(staff_id, start_time, end_time);

COMMENT ON TABLE bookings IS '予約情報';
COMMENT ON COLUMN bookings.is_recent IS '継続顧客フラグ（30日以内の再予約）';
COMMENT ON COLUMN bookings.cancel_token IS 'キャンセルURL用のセキュアトークン';

-- ============================================
-- 4. メール送信ログテーブル（Resend統合用）✨
-- ============================================
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- メール種別
  email_type TEXT NOT NULL CHECK (email_type IN (
    'booking_confirmation',      -- 予約確認メール（顧客向け）
    'booking_notification',      -- 予約通知メール（管理者向け）
    'booking_reminder_24h',      -- 24時間前リマインダー
    'booking_reminder_30m',      -- 30分前リマインダー
    'booking_cancelled',         -- キャンセル通知
    'booking_completed'          -- 完了通知
  )),

  -- 関連予約
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- 送信先
  to_email TEXT NOT NULL,
  to_name TEXT,

  -- 送信元
  from_email TEXT NOT NULL DEFAULT 'TIMREXPLUS <onboarding@resend.dev>',

  -- メール内容
  subject TEXT NOT NULL,
  body_html TEXT,
  body_text TEXT,

  -- Resend API レスポンス
  resend_id TEXT,
  resend_status TEXT,
  resend_error TEXT,

  -- 送信結果
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- メール送信ログのインデックス
CREATE INDEX idx_email_logs_booking_id ON email_logs(booking_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_to_email ON email_logs(to_email);
CREATE INDEX idx_email_logs_is_sent ON email_logs(is_sent);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

COMMENT ON TABLE email_logs IS 'メール送信履歴（Resend統合）';
COMMENT ON COLUMN email_logs.resend_id IS 'ResendのメールID';
COMMENT ON COLUMN email_logs.retry_count IS 'リトライ回数';

-- ============================================
-- 5. メールテンプレートテーブル（将来拡張用）✨
-- ============================================
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- テンプレート識別子
  template_key TEXT NOT NULL UNIQUE,
  template_name TEXT NOT NULL,

  -- テンプレート内容
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,

  -- 変数プレースホルダー（JSON形式）
  -- 例: {"client_name": "顧客名", "start_time": "予約日時", "staff_name": "担当者名"}
  placeholders JSONB,

  -- 有効フラグ
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_email_templates_template_key ON email_templates(template_key);
CREATE INDEX idx_email_templates_is_active ON email_templates(is_active);

COMMENT ON TABLE email_templates IS 'メールテンプレート管理';
COMMENT ON COLUMN email_templates.placeholders IS '利用可能な変数（JSON形式）';

-- ============================================
-- 初期データ投入
-- ============================================

-- 1. スタッフデータ
INSERT INTO staff (name, email, color) VALUES
  ('担当者A', 'staff-a@zettai.co.jp', '#6EC5FF'),
  ('担当者B', 'staff-b@zettai.co.jp', '#FFC870');

-- 2. 相談種別データ（商材1〜6）
INSERT INTO consultation_types (name, duration_minutes, display_order) VALUES
  ('商材1 - ベーシック相談', 30, 1),
  ('商材2 - プレミアム相談', 60, 2),
  ('商材3 - エンタープライズ相談', 45, 3),
  ('商材4 - コンサルティング', 90, 4),
  ('商材5 - サポート相談', 30, 5),
  ('商材6 - カスタム相談', 60, 6);

-- 3. メールテンプレート初期データ
INSERT INTO email_templates (template_key, template_name, subject, body_html, placeholders) VALUES
  (
    'booking_confirmation',
    '予約確認メール（顧客向け）',
    'ご予約を承りました - {{client_name}}様',
    '<html><body><h1>ご予約ありがとうございます</h1><p>{{client_name}}様</p><p>以下の内容でご予約を承りました。</p><ul><li>日時: {{start_time}}</li><li>担当者: {{staff_name}}</li><li>相談内容: {{consultation_type}}</li></ul></body></html>',
    '{"client_name": "顧客名", "start_time": "予約日時", "staff_name": "担当者名", "consultation_type": "相談種別"}'::jsonb
  ),
  (
    'booking_notification',
    '予約通知メール（管理者向け）',
    '🔔 新しい予約: {{client_name}}様 - {{start_time}}',
    '<html><body><h1>新しい予約が入りました</h1><p>顧客名: {{client_name}}</p><p>メール: {{client_email}}</p><p>日時: {{start_time}}</p><p>担当者: {{staff_name}}</p></body></html>',
    '{"client_name": "顧客名", "client_email": "顧客メール", "start_time": "予約日時", "staff_name": "担当者名"}'::jsonb
  );

-- ============================================
-- トリガー: updated_at自動更新
-- ============================================

-- updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- スタッフテーブルのトリガー
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 相談種別テーブルのトリガー
CREATE TRIGGER update_consultation_types_updated_at
  BEFORE UPDATE ON consultation_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 予約テーブルのトリガー
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- メールテンプレートテーブルのトリガー
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) 設定
-- ============================================

-- RLSを有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- スタッフテーブル: 全員が読み取り可能
CREATE POLICY "スタッフ情報は誰でも閲覧可能" ON staff
  FOR SELECT USING (is_active = true);

-- 相談種別テーブル: 全員が読み取り可能
CREATE POLICY "相談種別は誰でも閲覧可能" ON consultation_types
  FOR SELECT USING (is_active = true);

-- 予約テーブル: 誰でも作成可能（予約フォームから）
CREATE POLICY "予約は誰でも作成可能" ON bookings
  FOR INSERT WITH CHECK (true);

-- 予約テーブル: キャンセルトークンを持っている人は更新可能
CREATE POLICY "予約は本人のみキャンセル可能" ON bookings
  FOR UPDATE USING (true);

-- メールログ: サービスロールのみ操作可能
CREATE POLICY "メールログはサービスロールのみ操作可能" ON email_logs
  USING (true)
  WITH CHECK (true);

-- メールテンプレート: 全員が読み取り可能
CREATE POLICY "メールテンプレートは誰でも閲覧可能" ON email_templates
  FOR SELECT USING (is_active = true);

-- ============================================
-- 完了確認クエリ
-- ============================================
-- 以下のクエリで確認:
-- SELECT * FROM staff;
-- SELECT * FROM consultation_types;
-- SELECT * FROM email_templates;
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
