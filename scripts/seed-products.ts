/**
 * 商材のサンプルデータを投入するスクリプト
 *
 * 実行方法:
 * npx tsx scripts/seed-products.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '設定済み' : '未設定')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedProducts() {
  console.log('🌱 商材データを投入します...')

  // 既存の商材を確認
  const { data: existingProducts, error: checkError } = await supabase
    .from('products')
    .select('*')

  if (checkError) {
    console.error('❌ 商材テーブルの確認に失敗:', checkError)
    process.exit(1)
  }

  console.log(`📊 既存の商材数: ${existingProducts?.length || 0}`)

  // サンプル商材を作成
  const products = [
    {
      name: '初回相談',
      description: '初めてご利用の方向けの相談サービス',
      duration: 60,
      color: '#6EC5FF',
      is_active: true,
    },
    {
      name: 'フォローアップ相談',
      description: '既存顧客向けのフォローアップ相談',
      duration: 30,
      color: '#FFC870',
      is_active: true,
    },
  ]

  for (const product of products) {
    // 同じ名前の商材が既に存在するかチェック
    const existing = existingProducts?.find(p => p.name === product.name)

    if (existing) {
      console.log(`⏭️  スキップ: "${product.name}" は既に存在します`)
      continue
    }

    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) {
      console.error(`❌ "${product.name}" の作成に失敗:`, error)
      continue
    }

    console.log(`✅ 作成成功: "${product.name}" (ID: ${data.id})`)

    // 初回相談の場合は質問も追加
    if (product.name === '初回相談' && data) {
      const questions = [
        {
          product_id: data.id,
          question_text: 'ご相談内容を教えてください',
          question_type: 'textarea',
          is_required: true,
          order_index: 0,
        },
        {
          product_id: data.id,
          question_text: 'ご希望の連絡方法を選択してください',
          question_type: 'radio',
          options: ['メール', '電話', 'チャット'],
          is_required: true,
          order_index: 1,
        },
      ]

      for (const question of questions) {
        const { error: qError } = await supabase
          .from('product_questions')
          .insert(question)

        if (qError) {
          console.error(`  ❌ 質問の作成に失敗:`, qError)
        } else {
          console.log(`  ✅ 質問を追加: "${question.question_text}"`)
        }
      }
    }
  }

  // 最終的な商材数を確認
  const { data: finalProducts } = await supabase
    .from('products')
    .select('*')

  console.log(`\n📊 合計商材数: ${finalProducts?.length || 0}`)
  console.log('🎉 完了!')
}

seedProducts().catch(console.error)
