-- 商材（Products）テーブルの作成
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 30, -- デフォルト30分
  color VARCHAR(7) DEFAULT '#6EC5FF',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 商材質問（Product Questions）テーブルの作成
CREATE TABLE product_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'text', 'textarea', 'radio', 'checkbox', 'select'
  options JSONB, -- ラジオボタン、チェックボックス、選択肢の選択肢を格納
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 予約回答（Booking Answers）テーブルの作成（商材質問への回答を格納）
CREATE TABLE product_booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_json JSONB, -- 複数選択の場合
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_product_questions_product_id ON product_questions(product_id);
CREATE INDEX idx_product_questions_order ON product_questions(product_id, order_index);
CREATE INDEX idx_product_booking_answers_booking ON product_booking_answers(booking_id);
CREATE INDEX idx_product_booking_answers_question ON product_booking_answers(question_id);

-- RLS (Row Level Security) ポリシー
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_booking_answers ENABLE ROW LEVEL SECURITY;

-- 商材テーブルのポリシー（管理者のみ編集可能、全員読み取り可能）
CREATE POLICY "商材は全員が読み取り可能" ON products FOR SELECT USING (true);
CREATE POLICY "商材は管理者が作成可能" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "商材は管理者が更新可能" ON products FOR UPDATE USING (true);
CREATE POLICY "商材は管理者が削除可能" ON products FOR DELETE USING (true);

-- 商材質問テーブルのポリシー
CREATE POLICY "商材質問は全員が読み取り可能" ON product_questions FOR SELECT USING (true);
CREATE POLICY "商材質問は管理者が作成可能" ON product_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "商材質問は管理者が更新可能" ON product_questions FOR UPDATE USING (true);
CREATE POLICY "商材質問は管理者が削除可能" ON product_questions FOR DELETE USING (true);

-- 予約回答テーブルのポリシー
CREATE POLICY "予約回答は全員が読み取り可能" ON product_booking_answers FOR SELECT USING (true);
CREATE POLICY "予約回答は全員が作成可能" ON product_booking_answers FOR INSERT WITH CHECK (true);

-- サンプルデータの投入
INSERT INTO products (name, description, duration, color, is_active) VALUES
  ('初回相談', '初めてご利用の方向けの相談サービス', 60, '#6EC5FF', true),
  ('フォローアップ相談', '既存顧客向けのフォローアップ相談', 30, '#FFC870', true);

-- サンプル質問の投入
INSERT INTO product_questions (product_id, question_text, question_type, is_required, order_index)
SELECT
  p.id,
  'ご相談内容を教えてください',
  'textarea',
  true,
  1
FROM products p WHERE p.name = '初回相談';

INSERT INTO product_questions (product_id, question_text, question_type, options, is_required, order_index)
SELECT
  p.id,
  'ご希望の連絡方法を選択してください',
  'radio',
  '["メール", "電話", "チャット"]'::jsonb,
  true,
  2
FROM products p WHERE p.name = '初回相談';
