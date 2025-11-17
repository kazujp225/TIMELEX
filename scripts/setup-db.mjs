#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvwdeartscnskwskubek.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d2RlYXJ0c2Nuc2t3c2t1YmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1MDgzOSwiZXhwIjoyMDc4NTI2ODM5fQ.OpkSrQn6ibjxhUoAqyYaNAbfwB2ymOf2neqqr4M_kKw'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🚀 Supabase接続中...\n')

// DDL実行用のSQL
const ddl = `
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

-- RLSポリシー削除
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
CREATE POLICY "商材は全員が読み取り可能" ON public.products FOR SELECT USING (true);
CREATE POLICY "商材は管理者が作成可能" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "商材は管理者が更新可能" ON public.products FOR UPDATE USING (true);
CREATE POLICY "商材は管理者が削除可能" ON public.products FOR DELETE USING (true);
CREATE POLICY "商材質問は全員が読み取り可能" ON public.product_questions FOR SELECT USING (true);
CREATE POLICY "商材質問は管理者が作成可能" ON public.product_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "商材質問は管理者が更新可能" ON public.product_questions FOR UPDATE USING (true);
CREATE POLICY "商材質問は管理者が削除可能" ON public.product_questions FOR DELETE USING (true);
CREATE POLICY "予約回答は全員が読み取り可能" ON public.product_booking_answers FOR SELECT USING (true);
CREATE POLICY "予約回答は全員が作成可能" ON public.product_booking_answers FOR INSERT WITH CHECK (true);
`

// Supabase Management APIを使用してSQLを実行
console.log('📝 テーブル作成中...\n')

try {
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'apikey': supabaseServiceKey,
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: ddl })
  })

  if (!response.ok) {
    console.log('⚠️  Management API経由での実行に失敗。データ投入のみ実行します。\n')
  } else {
    console.log('✅ DDL実行完了\n')
  }
} catch (error) {
  console.log('⚠️  DDL実行をスキップ（テーブルは手動作成が必要）\n')
}

// サンプルデータを投入
console.log('🌱 サンプルデータを投入中...\n')

const { data: existingProducts, error: checkError } = await supabase
  .from('products')
  .select('name')

if (checkError) {
  console.error('❌ テーブルが存在しません。先にQUICK_SETUP.sqlを実行してください。')
  console.error('   エラー:', checkError.message)
  process.exit(1)
}

const existingNames = (existingProducts || []).map(p => p.name)

// 初回相談
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
    console.log('✅ 初回相談を作成')

    // 質問を追加
    const { error: qe } = await supabase.from('product_questions').insert([
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

    if (!qe) {
      console.log('   ✅ 質問2件を追加')
    }
  }
} else {
  console.log('⏭️  初回相談は既に存在します')
}

// フォローアップ相談
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
    console.log('✅ フォローアップ相談を作成')
  }
} else {
  console.log('⏭️  フォローアップ相談は既に存在します')
}

// 最終確認
const { data: finalProducts } = await supabase.from('products').select('*')
console.log(`\n📊 商材数: ${finalProducts?.length || 0}`)

if (finalProducts && finalProducts.length > 0) {
  console.log('\n商材一覧:')
  finalProducts.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name} (${p.duration}分) ${p.is_active ? '✅' : '❌'}`)
  })
}

console.log('\n🎉 完了！\n')
console.log('👉 http://localhost:3000/admin/products にアクセスして確認してください\n')
