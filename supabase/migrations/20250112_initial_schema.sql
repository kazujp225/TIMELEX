-- TIMREXPLUSデータベーススキーマ
-- バージョン: 1.0
-- 作成日: 2025-01-12

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto拡張を有効化（暗号化用）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. スタッフテーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    photo_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT true,
    google_refresh_token TEXT, -- 暗号化して保存
    google_token_expires_at TIMESTAMPTZ,
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Tokyo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- ==========================================
-- 2. 相談種別テーブル
-- ==========================================
CREATE TYPE consultation_mode AS ENUM ('immediate', 'manual');
CREATE TYPE recent_mode_override AS ENUM ('keep', 'switch_to_manual');

CREATE TABLE IF NOT EXISTS consultation_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 180),
    buffer_before_minutes INTEGER NOT NULL DEFAULT 5 CHECK (buffer_before_minutes >= 0 AND buffer_before_minutes <= 30),
    buffer_after_minutes INTEGER NOT NULL DEFAULT 5 CHECK (buffer_after_minutes >= 0 AND buffer_after_minutes <= 30),
    mode consultation_mode NOT NULL DEFAULT 'immediate',
    recent_mode_override recent_mode_override NOT NULL DEFAULT 'keep',
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_consultation_types_is_active ON consultation_types(is_active);
CREATE INDEX idx_consultation_types_display_order ON consultation_types(display_order);

-- ==========================================
-- 3. お問い合わせ元テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS inquiry_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_inquiry_sources_is_active ON inquiry_sources(is_active);
CREATE INDEX idx_inquiry_sources_display_order ON inquiry_sources(display_order);

-- ==========================================
-- 4. 予約テーブル
-- ==========================================
CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled');

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status booking_status NOT NULL DEFAULT 'confirmed',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    consultation_type_id UUID NOT NULL REFERENCES consultation_types(id) ON DELETE RESTRICT,
    inquiry_source_id UUID NOT NULL REFERENCES inquiry_sources(id) ON DELETE RESTRICT,

    -- クライアント情報（暗号化）
    client_name VARCHAR(50) NOT NULL, -- 暗号化して保存
    client_email VARCHAR(100) NOT NULL, -- 暗号化して保存、小文字正規化
    client_company VARCHAR(100), -- 暗号化して保存
    client_memo TEXT, -- 暗号化して保存

    is_recent BOOLEAN NOT NULL DEFAULT false,

    -- Google連携情報
    google_event_id VARCHAR(255) NOT NULL,
    google_meet_link VARCHAR(500) NOT NULL,

    -- 変更・キャンセル用トークン
    cancel_token VARCHAR(64) NOT NULL UNIQUE,

    -- UTM/追跡情報
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    utm_content VARCHAR(100),
    utm_term VARCHAR(100),
    referrer_url VARCHAR(500),
    ip_address VARCHAR(45), -- IPv6対応
    user_agent VARCHAR(500),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cancelled_at TIMESTAMPTZ
);

-- インデックス
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
CREATE INDEX idx_bookings_cancel_token ON bookings(cancel_token);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- 複合インデックス（検索最適化）
CREATE INDEX idx_bookings_staff_start_time ON bookings(staff_id, start_time) WHERE status = 'confirmed';

-- ==========================================
-- 5. 監査ログテーブル
-- ==========================================
CREATE TYPE actor_type AS ENUM ('client', 'staff', 'system');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'cancel', 'view');

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_type actor_type NOT NULL,
    actor_identifier VARCHAR(100) NOT NULL,
    action audit_action NOT NULL,
    target_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    state_before JSONB,
    state_after JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_audit_logs_target_booking_id ON audit_logs(target_booking_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_actor_identifier ON audit_logs(actor_identifier);

-- ==========================================
-- 6. スタッフ稼働時間テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS staff_working_hours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=日曜, 6=土曜
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(staff_id, day_of_week, start_time)
);

-- インデックス
CREATE INDEX idx_staff_working_hours_staff_id ON staff_working_hours(staff_id);

-- ==========================================
-- 7. スタッフ休暇テーブル
-- ==========================================
CREATE TYPE vacation_type AS ENUM ('full_day', 'morning', 'afternoon');

CREATE TABLE IF NOT EXISTS staff_vacations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    vacation_date DATE NOT NULL,
    vacation_type vacation_type NOT NULL DEFAULT 'full_day',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(staff_id, vacation_date)
);

-- インデックス
CREATE INDEX idx_staff_vacations_staff_id ON staff_vacations(staff_id);
CREATE INDEX idx_staff_vacations_date ON staff_vacations(vacation_date);

-- ==========================================
-- 8. グローバル設定テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS global_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- デフォルト設定を挿入
INSERT INTO global_settings (key, value, description) VALUES
    ('min_booking_notice_hours', '2', '最短予約猶予（時間）'),
    ('max_booking_days', '60', '最長予約期間（日）'),
    ('recent_customer_days', '30', '継続顧客判定期間（日）'),
    ('data_retention_days', '180', 'データ保持期間（日）'),
    ('change_cancel_deadline_hours', '2', '変更・キャンセル期限（時間）')
ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 9. トリガー関数（updated_at自動更新）
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultation_types_updated_at BEFORE UPDATE ON consultation_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiry_sources_updated_at BEFORE UPDATE ON inquiry_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_working_hours_updated_at BEFORE UPDATE ON staff_working_hours
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_vacations_updated_at BEFORE UPDATE ON staff_vacations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_settings_updated_at BEFORE UPDATE ON global_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 10. RLS（Row Level Security）ポリシー
-- ==========================================
-- ※ 本番環境ではRLSを有効化し、適切なポリシーを設定すること

-- ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- ... 他のテーブルも同様

-- ==========================================
-- 11. 初期データ投入
-- ==========================================

-- 相談種別の初期データ
INSERT INTO consultation_types (name, duration_minutes, buffer_before_minutes, buffer_after_minutes, mode, display_order) VALUES
    ('初回相談（AI導入）', 30, 5, 5, 'immediate', 1),
    ('デモ（具体機能）', 45, 10, 10, 'immediate', 2),
    ('見積・要件詰め', 60, 10, 10, 'manual', 3),
    ('契約前最終確認', 30, 5, 5, 'manual', 4)
ON CONFLICT DO NOTHING;

-- お問い合わせ元の初期データ
INSERT INTO inquiry_sources (name, display_order) VALUES
    ('自社コーポレートサイト', 1),
    ('製品LP（AI導入支援）', 2),
    ('製品LP（社員教育）', 3),
    ('外部メディア', 4),
    ('紹介', 5),
    ('広告（Google）', 6),
    ('広告（Meta）', 7),
    ('その他', 8)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 完了
-- ==========================================
COMMENT ON SCHEMA public IS 'TIMREXPLUSオンライン予約システム - 初期スキーマ v1.0';
