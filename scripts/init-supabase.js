#!/usr/bin/env node

/**
 * Supabaseデータベース初期化スクリプト
 *
 * 実行方法:
 * node scripts/init-supabase.js
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('環境変数確認:')
console.log(`URL: ${supabaseUrl}`)
console.log(`KEY: ${supabaseServiceKey ? '設定済み' : '未設定'}\n`)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ エラー: 環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env.local に設定してください')
  process.exit(1)
}

console.log('🔗 Supabaseに接続中...')
console.log(`URL: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAndInitialize() {
  try {
    console.log('📊 データベースの状態を確認中...\n')

    // 1. スタッフテーブルの確認
    console.log('1️⃣  スタッフテーブルを確認中...')
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('id, name, email')
      .limit(5)

    if (staffError) {
      if (staffError.code === '42P01') {
        console.log('   ⚠️  テーブルが存在しません')
        console.log('   📝 Supabaseダッシュボードで schema.sql を実行してください')
      } else {
        console.log(`   ❌ エラー: ${staffError.message}`)
      }
    } else if (staffData.length === 0) {
      console.log('   ✅ テーブルは存在しますが、データが空です')
      console.log('   🔄 初期データを投入します...')
      await insertInitialData()
    } else {
      console.log(`   ✅ スタッフデータ: ${staffData.length}件`)
      staffData.forEach(s => console.log(`      - ${s.name} (${s.email})`))
    }

    // 2. 相談種別テーブルの確認
    console.log('\n2️⃣  相談種別テーブルを確認中...')
    const { data: typesData, error: typesError } = await supabase
      .from('consultation_types')
      .select('id, name, duration_minutes')
      .order('display_order')

    if (typesError) {
      if (typesError.code === '42P01') {
        console.log('   ⚠️  テーブルが存在しません')
      } else {
        console.log(`   ❌ エラー: ${typesError.message}`)
      }
    } else if (typesData.length === 0) {
      console.log('   ✅ テーブルは存在しますが、データが空です')
      console.log('   🔄 初期データを投入します...')
      await insertInitialData()
    } else {
      console.log(`   ✅ 相談種別: ${typesData.length}件`)
      typesData.forEach(t => console.log(`      - ${t.name} (${t.duration_minutes}分)`))
    }

    // 3. 予約テーブルの確認
    console.log('\n3️⃣  予約テーブルを確認中...')
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, start_time')
      .limit(5)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      if (bookingsError.code === '42P01') {
        console.log('   ⚠️  テーブルが存在しません')
      } else {
        console.log(`   ❌ エラー: ${bookingsError.message}`)
      }
    } else {
      console.log(`   ✅ 予約データ: ${bookingsData.length}件（最新5件）`)
      bookingsData.forEach(b => {
        const date = new Date(b.start_time).toLocaleString('ja-JP')
        console.log(`      - ${b.status} - ${date}`)
      })
    }

    console.log('\n' + '='.repeat(50))
    if (staffError?.code === '42P01' || typesError?.code === '42P01' || bookingsError?.code === '42P01') {
      console.log('⚠️  テーブルが作成されていません')
      console.log('\n📝 次の手順でテーブルを作成してください:')
      console.log('1. Supabaseダッシュボードを開く')
      console.log(`   ${supabaseUrl.replace('/rest/v1', '')}`)
      console.log('2. 左メニューの「SQL Editor」をクリック')
      console.log('3. 「New query」をクリック')
      console.log('4. supabase/schema.sql の内容をコピー&ペースト')
      console.log('5. 「Run」ボタンをクリック')
      console.log('6. このスクリプトを再実行')
    } else {
      console.log('✅ データベースのセットアップが完了しています！')
      console.log('\n🎉 次のステップ:')
      console.log('   npm run dev でアプリケーションを起動')
      console.log('   http://localhost:3000/book/1 で予約フローをテスト')
    }
    console.log('='.repeat(50))

  } catch (error) {
    console.error('\n❌ 予期しないエラーが発生しました:', error)
    process.exit(1)
  }
}

async function insertInitialData() {
  try {
    // スタッフデータの投入
    const { data: existingStaff } = await supabase
      .from('staff')
      .select('id')
      .limit(1)

    if (!existingStaff || existingStaff.length === 0) {
      console.log('   📝 スタッフデータを投入中...')
      const { error: staffInsertError } = await supabase
        .from('staff')
        .insert([
          { name: '担当者A', email: 'staff-a@zettai.co.jp', color: '#6EC5FF' },
          { name: '担当者B', email: 'staff-b@zettai.co.jp', color: '#FFC870' }
        ])

      if (staffInsertError) {
        console.log(`   ❌ スタッフデータ投入エラー: ${staffInsertError.message}`)
      } else {
        console.log('   ✅ スタッフデータを投入しました')
      }
    }

    // 相談種別データの投入
    const { data: existingTypes } = await supabase
      .from('consultation_types')
      .select('id')
      .limit(1)

    if (!existingTypes || existingTypes.length === 0) {
      console.log('   📝 相談種別データを投入中...')
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
        console.log(`   ❌ 相談種別データ投入エラー: ${typesInsertError.message}`)
      } else {
        console.log('   ✅ 相談種別データを投入しました')
      }
    }
  } catch (error) {
    console.error('   ❌ 初期データ投入エラー:', error)
  }
}

checkAndInitialize()
