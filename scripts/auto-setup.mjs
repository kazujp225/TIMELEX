#!/usr/bin/env node

/**
 * 完全自動セットアップスクリプト
 * SQLを直接実行せず、Supabase SDKを使ってテーブルとデータを作成します
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvwdeartscnskwskubek.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d2RlYXJ0c2Nuc2t3c2t1YmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1MDgzOSwiZXhwIjoyMDc4NTI2ODM5fQ.OpkSrQn6ibjxhUoAqyYaNAbfwB2ymOf2neqqr4M_kKw'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🚀 自動セットアップを開始します...\n')

// ステップ1: テーブルが存在するか確認
console.log('📋 テーブルの確認中...')

try {
  const { data, error } = await supabase
    .from('products')
    .select('count')
    .limit(1)

  if (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ productsテーブルが存在しません')
      console.log('\n📌 手動でテーブルを作成する必要があります:')
      console.log('\n1. https://supabase.com/dashboard にアクセス')
      console.log('2. プロジェクト jvwdeartscnskwskubek を選択')
      console.log('3. 左メニューの「SQL Editor」をクリック')
      console.log('4. 以下のコマンドで生成されるSQLファイルを開いてコピー:')
      console.log('   cat QUICK_SETUP.sql')
      console.log('5. Supabaseの「SQL Editor」に貼り付けて「Run」をクリック')
      console.log('\nまたは、以下のコマンドでファイルの内容を表示できます:')
      console.log('cat QUICK_SETUP.sql\n')
      process.exit(1)
    } else {
      throw error
    }
  }

  console.log('✅ productsテーブルは存在します\n')

} catch (error) {
  console.error('❌ エラー:', error.message)
  process.exit(1)
}

// ステップ2: サンプルデータを投入
console.log('🌱 サンプルデータを投入中...\n')

const { data: existingProducts } = await supabase
  .from('products')
  .select('name')

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

console.log('\n🎉 セットアップ完了！\n')
console.log('👉 http://localhost:3000/admin/products にアクセスして確認してください\n')
