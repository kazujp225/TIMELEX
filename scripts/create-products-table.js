/**
 * Supabaseに商材テーブルを作成するスクリプト
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTables() {
  console.log('🚀 テーブル作成を開始します...\n')

  const queries = [
    // 商材テーブル
    `CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      duration INTEGER NOT NULL DEFAULT 30,
      color VARCHAR(7) DEFAULT '#6EC5FF',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`,

    // 商材質問テーブル
    `CREATE TABLE IF NOT EXISTS product_questions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type VARCHAR(50) NOT NULL,
      options JSONB,
      is_required BOOLEAN NOT NULL DEFAULT FALSE,
      order_index INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`,

    // 予約回答テーブル
    `CREATE TABLE IF NOT EXISTS product_booking_answers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES product_questions(id) ON DELETE CASCADE,
      answer_text TEXT,
      answer_json JSONB,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );`,

    // インデックス
    `CREATE INDEX IF NOT EXISTS idx_product_questions_product_id ON product_questions(product_id);`,
    `CREATE INDEX IF NOT EXISTS idx_product_questions_order ON product_questions(product_id, order_index);`,
    `CREATE INDEX IF NOT EXISTS idx_product_booking_answers_booking ON product_booking_answers(booking_id);`,
    `CREATE INDEX IF NOT EXISTS idx_product_booking_answers_question ON product_booking_answers(question_id);`,

    // RLS有効化
    `ALTER TABLE products ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE product_questions ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE product_booking_answers ENABLE ROW LEVEL SECURITY;`,

    // RLSポリシー - products
    `DROP POLICY IF EXISTS "商材は全員が読み取り可能" ON products;`,
    `CREATE POLICY "商材は全員が読み取り可能" ON products FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "商材は管理者が作成可能" ON products;`,
    `CREATE POLICY "商材は管理者が作成可能" ON products FOR INSERT WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "商材は管理者が更新可能" ON products;`,
    `CREATE POLICY "商材は管理者が更新可能" ON products FOR UPDATE USING (true);`,
    `DROP POLICY IF EXISTS "商材は管理者が削除可能" ON products;`,
    `CREATE POLICY "商材は管理者が削除可能" ON products FOR DELETE USING (true);`,

    // RLSポリシー - product_questions
    `DROP POLICY IF EXISTS "商材質問は全員が読み取り可能" ON product_questions;`,
    `CREATE POLICY "商材質問は全員が読み取り可能" ON product_questions FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "商材質問は管理者が作成可能" ON product_questions;`,
    `CREATE POLICY "商材質問は管理者が作成可能" ON product_questions FOR INSERT WITH CHECK (true);`,
    `DROP POLICY IF EXISTS "商材質問は管理者が更新可能" ON product_questions;`,
    `CREATE POLICY "商材質問は管理者が更新可能" ON product_questions FOR UPDATE USING (true);`,
    `DROP POLICY IF EXISTS "商材質問は管理者が削除可能" ON product_questions;`,
    `CREATE POLICY "商材質問は管理者が削除可能" ON product_questions FOR DELETE USING (true);`,

    // RLSポリシー - product_booking_answers
    `DROP POLICY IF EXISTS "予約回答は全員が読み取り可能" ON product_booking_answers;`,
    `CREATE POLICY "予約回答は全員が読み取り可能" ON product_booking_answers FOR SELECT USING (true);`,
    `DROP POLICY IF EXISTS "予約回答は全員が作成可能" ON product_booking_answers;`,
    `CREATE POLICY "予約回答は全員が作成可能" ON product_booking_answers FOR INSERT WITH CHECK (true);`,
  ]

  for (const query of queries) {
    const { error } = await supabase.rpc('exec_sql', { sql: query })
    if (error && !error.message.includes('already exists')) {
      console.log('⚠️  クエリ実行:', query.substring(0, 50) + '...')
      console.log('   結果:', error ? '⚠️' : '✅')
    }
  }

  console.log('\n✅ テーブル作成完了\n')

  // サンプルデータを投入
  console.log('🌱 サンプルデータを投入します...\n')

  const { data: existingProducts } = await supabase
    .from('products')
    .select('name')

  const existingNames = (existingProducts || []).map(p => p.name)

  if (!existingNames.includes('初回相談')) {
    const { data: product1, error: e1 } = await supabase
      .from('products')
      .insert({
        name: '初回相談',
        description: '初めてご利用の方向けの相談サービス',
        duration: 60,
        color: '#6EC5FF',
        is_active: true,
      })
      .select()
      .single()

    if (e1) {
      console.log('❌ 初回相談の作成失敗:', e1.message)
    } else {
      console.log('✅ 初回相談を作成しました')

      // 質問を追加
      await supabase.from('product_questions').insert([
        {
          product_id: product1.id,
          question_text: 'ご相談内容を教えてください',
          question_type: 'textarea',
          is_required: true,
          order_index: 0,
        },
        {
          product_id: product1.id,
          question_text: 'ご希望の連絡方法を選択してください',
          question_type: 'radio',
          options: ['メール', '電話', 'チャット'],
          is_required: true,
          order_index: 1,
        },
      ])
      console.log('✅ 質問を追加しました')
    }
  }

  if (!existingNames.includes('フォローアップ相談')) {
    const { error: e2 } = await supabase
      .from('products')
      .insert({
        name: 'フォローアップ相談',
        description: '既存顧客向けのフォローアップ相談',
        duration: 30,
        color: '#FFC870',
        is_active: true,
      })

    if (e2) {
      console.log('❌ フォローアップ相談の作成失敗:', e2.message)
    } else {
      console.log('✅ フォローアップ相談を作成しました')
    }
  }

  const { data: finalProducts } = await supabase.from('products').select('*')
  console.log(`\n📊 合計商材数: ${finalProducts?.length || 0}`)
  console.log('🎉 完了!\n')
}

createTables().catch(console.error)
