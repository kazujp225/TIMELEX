-- Questionnaires (事前アンケート機能)
-- 予約前にクライアントから情報を収集するためのアンケートシステム

-- アンケートテンプレート
CREATE TABLE questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  consultation_type_id UUID REFERENCES consultation_types(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 質問
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questionnaire_id UUID NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('text', 'textarea', 'radio', 'checkbox', 'select')),
  options JSONB, -- radioやcheckboxの選択肢 (["選択肢1", "選択肢2", ...])
  is_required BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 予約に対する回答
CREATE TABLE booking_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_json JSONB, -- checkbox等の複数選択の場合
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(booking_id, question_id)
);

-- Indexes
CREATE INDEX idx_questionnaires_consultation_type ON questionnaires(consultation_type_id);
CREATE INDEX idx_questionnaires_active ON questionnaires(is_active);
CREATE INDEX idx_questions_questionnaire ON questions(questionnaire_id);
CREATE INDEX idx_questions_order ON questions(questionnaire_id, display_order);
CREATE INDEX idx_booking_answers_booking ON booking_answers(booking_id);
CREATE INDEX idx_booking_answers_question ON booking_answers(question_id);

-- Triggers for updated_at
CREATE TRIGGER update_questionnaires_updated_at
  BEFORE UPDATE ON questionnaires
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_answers_updated_at
  BEFORE UPDATE ON booking_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE questionnaires IS '事前アンケートテンプレート';
COMMENT ON TABLE questions IS 'アンケートの質問';
COMMENT ON TABLE booking_answers IS '予約に対するアンケート回答';

COMMENT ON COLUMN questionnaires.consultation_type_id IS '紐づく相談種別（NULLの場合は全種別で使用）';
COMMENT ON COLUMN questions.question_type IS '質問タイプ: text=短文, textarea=長文, radio=ラジオボタン, checkbox=チェックボックス, select=プルダウン';
COMMENT ON COLUMN questions.options IS 'radio/checkbox/selectの選択肢（JSON配列）';
COMMENT ON COLUMN booking_answers.answer_json IS 'checkboxなど複数選択の場合の回答（JSON配列）';

-- 初期データ: サンプルアンケート
INSERT INTO questionnaires (name, description, consultation_type_id, is_active, display_order)
VALUES
  ('一般相談用アンケート', '初回相談時に記入していただく基本情報', NULL, TRUE, 0);

-- 初期データ: サンプル質問
INSERT INTO questions (questionnaire_id, question_text, question_type, is_required, display_order, placeholder, help_text)
SELECT
  id,
  'ご相談の目的を教えてください',
  'textarea',
  TRUE,
  0,
  '例: 新規事業の立ち上げについて相談したい',
  'できるだけ具体的にご記入ください'
FROM questionnaires WHERE name = '一般相談用アンケート';

INSERT INTO questions (questionnaire_id, question_text, question_type, options, is_required, display_order)
SELECT
  id,
  'ご相談の緊急度はどの程度ですか？',
  'radio',
  '["できるだけ早く対応してほしい", "1週間以内に対応してほしい", "1ヶ月以内に対応してほしい", "特に急ぎではない"]'::jsonb,
  TRUE,
  1
FROM questionnaires WHERE name = '一般相談用アンケート';

INSERT INTO questions (questionnaire_id, question_text, question_type, options, is_required, display_order)
SELECT
  id,
  '当社をどこでお知りになりましたか？（複数選択可）',
  'checkbox',
  '["検索エンジン", "SNS", "知人の紹介", "広告", "その他"]'::jsonb,
  FALSE,
  2
FROM questionnaires WHERE name = '一般相談用アンケート';
