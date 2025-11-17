-- product_questionsテーブルの外部キー制約を修正
-- product_idがconsultation_typesを参照するように変更

-- 既存の外部キー制約を削除
ALTER TABLE product_questions
  DROP CONSTRAINT IF EXISTS product_questions_product_id_fkey;

-- 新しい外部キー制約を追加（consultation_typesを参照）
ALTER TABLE product_questions
  ADD CONSTRAINT product_questions_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES consultation_types(id)
  ON DELETE CASCADE;

-- コメント追加
COMMENT ON COLUMN product_questions.product_id IS '相談種別ID（consultation_types.idを参照）';
