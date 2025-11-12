#!/usr/bin/env node

/**
 * Supabaseテーブル自動作成スクリプト（MCP風）
 *
 * 実行方法:
 * node scripts/create-tables.js
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ エラー: 環境変数が設定されていません')
  process.exit(1)
}

console.log('🚀 Supabaseテーブル自動作成を開始します...\n')
console.log(`📡 接続先: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// SQLを分割して実行する関数
async function executeSQL(sql, description) {
  console.log(`🔧 ${description}`)

  try {
    // Supabase Postgresに直接SQL実行
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      // RPC関数が存在しない場合は、REST APIで直接実行を試みる
      if (error.message.includes('function') || error.code === '42883') {
        console.log('   ⚠️  RPC経由での実行をスキップ（手動実行が必要）')
        return false
      }
      throw error
    }

    console.log('   ✅ 完了')
    return true
  } catch (error) {
    console.error(`   ❌ エラー: ${error.message}`)
    return false
  }
}

async function createTables() {
  let needsManualExecution = false

  // 1. スタッフテーブル
  const createStaffTable = await executeSQL(`
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
  `, 'スタッフテーブルを作成中...')

  if (!createStaffTable) needsManualExecution = true

  // 2. 相談種別テーブル
  const createConsultationTypesTable = await executeSQL(`
    CREATE TABLE IF NOT EXISTS consultation_types (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_consultation_types_is_active ON consultation_types(is_active);
    CREATE INDEX IF NOT EXISTS idx_consultation_types_display_order ON consultation_types(display_order);
  `, '相談種別テーブルを作成中...')

  if (!createConsultationTypesTable) needsManualExecution = true

  // REST APIで初期データを投入
  console.log('\n📝 初期データを投入中...')

  // スタッフデータ
  const { data: existingStaff, error: staffCheckError } = await supabase
    .from('staff')
    .select('id')
    .limit(1)

  if (staffCheckError) {
    if (staffCheckError.code === '42P01') {
      console.log('   ⚠️  スタッフテーブルが存在しません（手動実行が必要）')
      needsManualExecution = true
    } else {
      console.error(`   ❌ スタッフテーブル確認エラー: ${staffCheckError.message}`)
    }
  } else if (!existingStaff || existingStaff.length === 0) {
    console.log('   📌 スタッフデータを投入中...')
    const { error: staffInsertError } = await supabase
      .from('staff')
      .insert([
        { name: '担当者A', email: 'staff-a@zettai.co.jp', color: '#6EC5FF' },
        { name: '担当者B', email: 'staff-b@zettai.co.jp', color: '#FFC870' }
      ])

    if (staffInsertError) {
      console.error(`   ❌ スタッフデータ投入エラー: ${staffInsertError.message}`)
    } else {
      console.log('   ✅ スタッフデータ投入完了')
    }
  } else {
    console.log('   ✅ スタッフデータは既に存在します')
  }

  // 相談種別データ
  const { data: existingTypes, error: typesCheckError } = await supabase
    .from('consultation_types')
    .select('id')
    .limit(1)

  if (typesCheckError) {
    if (typesCheckError.code === '42P01') {
      console.log('   ⚠️  相談種別テーブルが存在しません（手動実行が必要）')
      needsManualExecution = true
    } else {
      console.error(`   ❌ 相談種別テーブル確認エラー: ${typesCheckError.message}`)
    }
  } else if (!existingTypes || existingTypes.length === 0) {
    console.log('   📌 相談種別データを投入中...')
    const { error: typesInsertError } = await supabase
      .from('consultation_types')
      .insert([
        { name: '商材1 - ベーシック相談', duration_minutes: 30, display_order: 1 },
        { name: '商材2 - プレミアム相談', duration_minutes: 60, display_order: 2 },
        { name: '商材3 - エンタープライズ相談', duration_minutes: 45, display_order: 3 },
        { name: '商材4 - コンサルティング', duration_minutes: 90, display_order: 4 },
        { name: '商材5 - サポート相談', duration_minutes: 30, display_order: 5 },
        { name: '商材6 - カスタム相談', duration_minutes: 60, display_order: 6 }
      ])

    if (typesInsertError) {
      console.error(`   ❌ 相談種別データ投入エラー: ${typesInsertError.message}`)
    } else {
      console.log('   ✅ 相談種別データ投入完了')
    }
  } else {
    console.log('   ✅ 相談種別データは既に存在します')
  }

  // 結果表示
  console.log('\n' + '='.repeat(60))
  if (needsManualExecution) {
    console.log('⚠️  一部のテーブルを自動作成できませんでした')
    console.log('\n📝 Supabaseダッシュボードで手動実行が必要です:')
    console.log('1. https://supabase.com/dashboard にアクセス')
    console.log('2. SQL Editor で schema-with-resend.sql を実行')
    console.log('3. このスクリプトを再実行')
  } else {
    console.log('✅ データベースセットアップが完了しました！')
    console.log('\n🎉 次のステップ:')
    console.log('   npm run dev でアプリケーションを起動')
    console.log('   http://localhost:3000/book/1 で予約フローをテスト')
  }
  console.log('='.repeat(60))
}

createTables()
