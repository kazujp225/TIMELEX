-- クライアント管理テーブル
-- 各クライアントに専用の予約URLを発行

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100),
  company VARCHAR(100),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  booking_url TEXT GENERATED ALWAYS AS ('https://yourapp.com/book/client/' || slug) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_clients_slug ON clients(slug);
CREATE INDEX idx_clients_is_active ON clients(is_active);

-- トリガー: updated_at自動更新
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- スラッグの自動生成関数
CREATE OR REPLACE FUNCTION generate_unique_slug(client_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- 名前をスラッグ化（小文字、ハイフン区切り）
  base_slug := lower(regexp_replace(client_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- 一意性チェック
  WHILE EXISTS (SELECT 1 FROM clients WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- RLS設定
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- アクティブなクライアントは誰でも閲覧可能
CREATE POLICY "アクティブなクライアントは誰でも閲覧可能" ON clients
  FOR SELECT USING (is_active = true);

-- サービスロールは全操作可能
CREATE POLICY "サービスロールはクライアントを全操作可能" ON clients
  USING (true)
  WITH CHECK (true);

-- コメント
COMMENT ON TABLE clients IS 'クライアント管理テーブル - 専用予約URL発行用';
COMMENT ON COLUMN clients.slug IS 'URL用の一意な識別子（例: acme-corp）';
COMMENT ON COLUMN clients.booking_url IS '自動生成される予約URL';

-- サンプルデータ
INSERT INTO clients (name, slug, email, company, description) VALUES
  ('Acme Corporation', 'acme-corp', 'contact@acme.com', 'Acme Corporation', 'テストクライアント1'),
  ('Tech Solutions', 'tech-solutions', 'info@techsolutions.com', 'Tech Solutions Inc.', 'テストクライアント2');
