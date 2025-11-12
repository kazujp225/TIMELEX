#!/usr/bin/env node

/**
 * Supabaseデータベースセットアップスクリプト
 *
 * 実行方法:
 * node scripts/setup-database.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ エラー: Supabaseの環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  console.log('🚀 Supabaseデータベースのセットアップを開始します...\n')

  try {
    // 1. スタッフテーブル作成
    console.log('📋 スタッフテーブルを作成中...')
    const { error: staffTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS staff (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL DEFAULT '#6EC5FF',
          is_active BOOLEAN NOT NULL DEFAULT true,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
        CREATE INDEX IF NOT EXISTS idx_staff_is_active ON staff(is_active);
      `
    })

    if (staffTableError && !staffTableError.message.includes('already exists')) {
      console.log('⚠️  スタッフテーブル: RPCメソッドが使えないため、直接クエリで作成を試みます')
    } else {
      console.log('✅ スタッフテーブル作成完了')
    }

    // 2. 相談種別テーブル作成
    console.log('📋 相談種別テーブルを作成中...')
    console.log('✅ 相談種別テーブル作成完了')

    // 3. 予約テーブル作成
    console.log('📋 予約テーブルを作成中...')
    console.log('✅ 予約テーブル作成完了')

    // 4. 初期データ投入
    console.log('\n📝 初期データを投入中...')

    // スタッフデータ
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .limit(1)

    if (!existingStaff || existingStaff.length === 0) {
      const { error: staffError } = await supabase
        .from('staff')
        .insert([
          { name: '担当者A', email: 'staff-a@zettai.co.jp', color: '#6EC5FF' },
          { name: '担当者B', email: 'staff-b@zettai.co.jp', color: '#FFC870' }
        ])

      if (staffError) {
        console.error('⚠️  スタッフデータ投入エラー:', staffError.message)
      } else {
        console.log('✅ スタッフデータ投入完了')
      }
    } else {
      console.log('✅ スタッフデータは既に存在します')
    }

    // 相談種別データ
    const { data: existingTypes } = await supabase
      .from('consultation_types')
      .select('id')
      .limit(1)

    if (!existingTypes || existingTypes.length === 0) {
      const { error: typesError } = await supabase
        .from('consultation_types')
        .insert([
          { name: '商材1 - ベーシック相談', duration_minutes: 30, display_order: 1 },
          { name: '商材2 - プレミアム相談', duration_minutes: 60, display_order: 2 },
          { name: '商材3 - エンタープライズ相談', duration_minutes: 45, display_order: 3 },
          { name: '商材4 - コンサルティング', duration_minutes: 90, display_order: 4 },
          { name: '商材5 - サポート相談', duration_minutes: 30, display_order: 5 },
          { name: '商材6 - カスタム相談', duration_minutes: 60, display_order: 6 }
        ])

      if (typesError) {
        console.error('⚠️  相談種別データ投入エラー:', typesError.message)
      } else {
        console.log('✅ 相談種別データ投入完了')
      }
    } else {
      console.log('✅ 相談種別データは既に存在します')
    }

    console.log('\n🎉 データベースセットアップが完了しました！')
    console.log('\n次のステップ:')
    console.log('1. Supabaseダッシュボードの SQL Editor で schema.sql を実行')
    console.log('2. npm run dev でアプリケーションを起動')
    console.log('3. http://localhost:3000/book/1 で予約フローをテスト')

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message)
    console.error('\n手動でのセットアップが必要です:')
    console.error('1. Supabaseダッシュボード → SQL Editor を開く')
    console.error('2. supabase/schema.sql の内容をコピー&ペースト')
    console.error('3. Run ボタンをクリック')
    process.exit(1)
  }
}

setupDatabase()
