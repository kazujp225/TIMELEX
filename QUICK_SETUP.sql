-- ============================================
-- TIMREXPLUS 商材管理システム クイックセットアップ
-- ============================================
--
-- 実行方法:
-- 1. https://supabase.com にアクセス
-- 2. プロジェクトを選択
-- 3. 左サイドバーの「SQL Editor」をクリック
-- 4. このファイルの内容を全てコピー&ペースト
-- 5. 「Run」ボタンをクリック
--
-- ============================================

-- 商材テーブル
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  color VARCHAR(7) NOT NULL DEFAULT '#6EC5FF',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 商材質問テーブル
CREATE TABLE IF NOT EXISTS public.product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('text','textarea','radio','checkbox','select')),
  options JSONB,
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 予約回答テーブル
CREATE TABLE IF NOT EXISTS public.product_booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.product_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_product_questions_product_id ON public.product_questions(product_id);
CREATE INDEX IF NOT EXISTS idx_product_questions_order ON public.product_questions(product_id, order_index);
CREATE INDEX IF NOT EXISTS idx_product_booking_answers_booking ON public.product_booking_answers(booking_id);
CREATE INDEX IF NOT EXISTS idx_product_booking_answers_question ON public.product_booking_answers(question_id);

-- RLS有効化
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_booking_answers ENABLE ROW LEVEL SECURITY;

-- RLSポリシー削除（既存があれば）
DROP POLICY IF EXISTS "商材は全員が読み取り可能" ON public.products;
DROP POLICY IF EXISTS "商材は管理者が作成可能" ON public.products;
DROP POLICY IF EXISTS "商材は管理者が更新可能" ON public.products;
DROP POLICY IF EXISTS "商材は管理者が削除可能" ON public.products;

DROP POLICY IF EXISTS "商材質問は全員が読み取り可能" ON public.product_questions;
DROP POLICY IF EXISTS "商材質問は管理者が作成可能" ON public.product_questions;
DROP POLICY IF EXISTS "商材質問は管理者が更新可能" ON public.product_questions;
DROP POLICY IF EXISTS "商材質問は管理者が削除可能" ON public.product_questions;

DROP POLICY IF EXISTS "予約回答は全員が読み取り可能" ON public.product_booking_answers;
DROP POLICY IF EXISTS "予約回答は全員が作成可能" ON public.product_booking_answers;

-- RLSポリシー作成
-- 商材テーブル
CREATE POLICY "商材は全員が読み取り可能" ON public.products FOR SELECT USING (true);
CREATE POLICY "商材は管理者が作成可能" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "商材は管理者が更新可能" ON public.products FOR UPDATE USING (true);
CREATE POLICY "商材は管理者が削除可能" ON public.products FOR DELETE USING (true);

-- 商材質問テーブル
CREATE POLICY "商材質問は全員が読み取り可能" ON public.product_questions FOR SELECT USING (true);
CREATE POLICY "商材質問は管理者が作成可能" ON public.product_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "商材質問は管理者が更新可能" ON public.product_questions FOR UPDATE USING (true);
CREATE POLICY "商材質問は管理者が削除可能" ON public.product_questions FOR DELETE USING (true);

-- 予約回答テーブル
CREATE POLICY "予約回答は全員が読み取り可能" ON public.product_booking_answers FOR SELECT USING (true);
CREATE POLICY "予約回答は全員が作成可能" ON public.product_booking_answers FOR INSERT WITH CHECK (true);

-- サンプルデータ投入
INSERT INTO public.products (name, description, duration, color, is_active)
VALUES
  ('初回相談', '初めてご利用の方向けの相談サービス', 60, '#6EC5FF', true),
  ('フォローアップ相談', '既存顧客向けのフォローアップ相談', 30, '#FFC870', true)
ON CONFLICT DO NOTHING;

-- サンプル質問投入（初回相談用）
INSERT INTO public.product_questions (product_id, question_text, question_type, is_required, order_index)
SELECT
  p.id,
  'ご相談内容を教えてください',
  'textarea',
  true,
  0
FROM public.products p WHERE p.name = '初回相談'
ON CONFLICT DO NOTHING;

INSERT INTO public.product_questions (product_id, question_text, question_type, options, is_required, order_index)
SELECT
  p.id,
  'ご希望の連絡方法を選択してください',
  'radio',
  '["メール", "電話", "チャット"]'::jsonb,
  true,
  1
FROM public.products p WHERE p.name = '初回相談'
ON CONFLICT DO NOTHING;

-- 確認用クエリ
SELECT
  'テーブル作成完了' as status,
  (SELECT count(*) FROM public.products) as products_count,
  (SELECT count(*) FROM public.product_questions) as questions_count;
