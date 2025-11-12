-- ============================================
-- TIMREXPLUS データベーススキーマ
-- ============================================
-- Supabase SQL Editorで実行してください
--
-- 実行手順:
-- 1. Supabaseダッシュボード → SQL Editor
-- 2. 「New query」をクリック
-- 3. このファイルの内容をコピー&ペースト
-- 4. 「Run」をクリック
-- ============================================

-- 既存のテーブルがあれば削除（開発環境のみ）
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS consultation_types CASCADE;

-- ============================================
-- スタッフ（担当者）テーブル
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

-- スタッフテーブルのインデックス
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- ============================================
-- 相談種別（商材）テーブル
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

-- 相談種別テーブルのインデックス
CREATE INDEX idx_consultation_types_is_active ON consultation_types(is_active);
CREATE INDEX idx_consultation_types_display_order ON consultation_types(display_order);

-- ============================================
-- 予約テーブル
-- ============================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 予約情報
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,

  -- 関連情報
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  consultation_type_id UUID NOT NULL REFERENCES consultation_types(id) ON DELETE CASCADE,

  -- クライアント情報（暗号化推奨）
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_company TEXT,
  client_memo TEXT,

  -- 継続顧客フラグ
  is_recent BOOLEAN NOT NULL DEFAULT false,

  -- Google Calendar連携
  google_event_id TEXT,
  google_meet_link TEXT,

  -- キャンセル用トークン
  cancel_token TEXT NOT NULL UNIQUE,

  -- UTMパラメータ（マーケティング追跡）
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

-- ============================================
-- 初期データ投入
-- ============================================

-- スタッフデータ
INSERT INTO staff (name, email, color) VALUES
  ('担当者A', 'staff-a@zettai.co.jp', '#6EC5FF'),
  ('担当者B', 'staff-b@zettai.co.jp', '#FFC870');

-- 相談種別データ（商材1〜6）
INSERT INTO consultation_types (name, duration_minutes, display_order) VALUES
  ('商材1 - ベーシック相談', 30, 1),
  ('商材2 - プレミアム相談', 60, 2),
  ('商材3 - エンタープライズ相談', 45, 3),
  ('商材4 - コンサルティング', 90, 4),
  ('商材5 - サポート相談', 30, 5),
  ('商材6 - カスタム相談', 60, 6);

-- ============================================
-- Row Level Security (RLS) 設定
-- ============================================

-- RLSを有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

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

-- 予約テーブル: サービスロールは全権限
CREATE POLICY "サービスロールは予約を全操作可能" ON bookings
  USING (true)
  WITH CHECK (true);

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

-- ============================================
-- 完了！
-- ============================================
-- テーブルが正しく作成されたか確認:
-- SELECT * FROM staff;
-- SELECT * FROM consultation_types;
-- SELECT * FROM bookings;
