#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkCurrentState() {
  console.log('🔍 現在のSupabase状態を確認中...\n')
  console.log('📡 接続先:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('')

  let allGood = true

  // 1. スタッフテーブル確認
  console.log('1️⃣  staffテーブルをチェック...')
  const { data: staff, error: staffError } = await supabase
    .from('staff')
    .select('*')

  if (staffError) {
    console.log('   ❌ テーブルが存在しません:', staffError.message)
    allGood = false
  } else {
    console.log(`   ✅ 存在します（${staff?.length || 0}件のデータ）`)
    if (staff && staff.length > 0) {
      staff.forEach(s => console.log(`      - ${s.name} (${s.email})`))
    }
  }

  // 2. 商材テーブル確認
  console.log('\n2️⃣  consultation_typesテーブルをチェック...')
  const { data: types, error: typesError } = await supabase
    .from('consultation_types')
    .select('*')
    .order('display_order', { ascending: true })

  if (typesError) {
    console.log('   ❌ テーブルが存在しません:', typesError.message)
    allGood = false
  } else {
    console.log(`   ✅ 存在します（${types?.length || 0}件のデータ）`)
    if (types && types.length > 0) {
      types.forEach(t => console.log(`      - ${t.name} (${t.duration_minutes}分)`))
    }
  }

  // 3. 予約テーブル確認
  console.log('\n3️⃣  bookingsテーブルをチェック...')
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .limit(5)

  if (bookingsError) {
    console.log('   ❌ テーブルが存在しません:', bookingsError.message)
    allGood = false
  } else {
    console.log(`   ✅ 存在します（${bookings?.length || 0}件のデータ）`)
  }

  // 4. メールログテーブル確認
  console.log('\n4️⃣  email_logsテーブルをチェック...')
  const { data: emails, error: emailsError } = await supabase
    .from('email_logs')
    .select('*')
    .limit(5)

  if (emailsError) {
    console.log('   ❌ テーブルが存在しません:', emailsError.message)
    allGood = false
  } else {
    console.log(`   ✅ 存在します（${emails?.length || 0}件のデータ）`)
  }

  console.log('\n' + '='.repeat(50))

  if (allGood) {
    console.log('\n🎉 完璧！全てのテーブルが存在します！')
    console.log('✅ Supabaseは既に準備完了です！')
    console.log('\n次のステップ:')
    console.log('1. アプリを起動: npm run dev')
    console.log('2. ブラウザで確認: http://localhost:3000')
  } else {
    console.log('\n⚠️  いくつかのテーブルが見つかりません')
    console.log('\n📋 対処法:')
    console.log('1. supabase/EXECUTE_THIS.sql をSupabaseダッシュボードで実行')
    console.log('2. または、以下のURLで手動実行:')
    console.log('   https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
  }

  console.log('\n' + '='.repeat(50))
}

checkCurrentState().catch(console.error)
