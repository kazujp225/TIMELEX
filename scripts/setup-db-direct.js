#!/usr/bin/env node

/**
 * Supabase直接接続でテーブル作成
 */

const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Supabaseデータベースセットアップ開始\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function createTablesAndData() {
  try {
    // ステップ1: スタッフデータを投入
    console.log('1️⃣  スタッフデータを投入中...')
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .insert([
        { name: '担当者A', email: 'staff-a@zettai.co.jp', color: '#6EC5FF' },
        { name: '担当者B', email: 'staff-b@zettai.co.jp', color: '#FFC870' }
      ])
      .select()

    if (staffError) {
      if (staffError.code === '42P01') {
        throw new Error('テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。')
      }
      if (staffError.code === '23505') {
        console.log('   ✅ スタッフデータは既に存在します')
      } else {
        throw staffError
      }
    } else {
      console.log('   ✅ スタッフデータ投入完了')
    }

    // ステップ2: 相談種別データを投入
    console.log('\n2️⃣  相談種別データを投入中...')
    const { data: types, error: typesError } = await supabase
      .from('consultation_types')
      .insert([
        { name: '商材1 - ベーシック相談', duration_minutes: 30, display_order: 1 },
        { name: '商材2 - プレミアム相談', duration_minutes: 60, display_order: 2 },
        { name: '商材3 - エンタープライズ相談', duration_minutes: 45, display_order: 3 },
        { name: '商材4 - コンサルティング', duration_minutes: 90, display_order: 4 },
        { name: '商材5 - サポート相談', duration_minutes: 30, display_order: 5 },
        { name: '商材6 - カスタム相談', duration_minutes: 60, display_order: 6 }
      ])
      .select()

    if (typesError) {
      if (typesError.code === '42P01') {
        throw new Error('テーブルが存在しません。Supabaseダッシュボードでテーブルを作成してください。')
      }
      if (typesError.code === '23505') {
        console.log('   ✅ 相談種別データは既に存在します')
      } else {
        throw typesError
      }
    } else {
      console.log('   ✅ 相談種別データ投入完了')
    }

    // ステップ3: データ確認
    console.log('\n3️⃣  データを確認中...')
    const { data: staffList, error: staffListError } = await supabase
      .from('staff')
      .select('*')

    if (staffListError) throw staffListError

    console.log(`   ✅ スタッフ: ${staffList.length}件`)
    staffList.forEach(s => console.log(`      - ${s.name} (${s.email})`))

    const { data: typesList, error: typesListError } = await supabase
      .from('consultation_types')
      .select('*')
      .order('display_order')

    if (typesListError) throw typesListError

    console.log(`   ✅ 相談種別: ${typesList.length}件`)
    typesList.forEach(t => console.log(`      - ${t.name} (${t.duration_minutes}分)`))

    console.log('\n' + '='.repeat(60))
    console.log('✅ データベースセットアップ完了！')
    console.log('\n🎉 次のステップ:')
    console.log('   npm run dev でアプリケーションを起動')
    console.log('   http://localhost:3000/book/1 で予約フローをテスト')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error.message)

    if (error.message.includes('テーブルが存在しません')) {
      console.log('\n📋 以下のリンクでテーブルを作成してください:')
      console.log('https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
      console.log('\nコピー&ペーストして実行:')
      console.log(getSQLForManualExecution())
    }
    process.exit(1)
  }
}

function getSQLForManualExecution() {
  return `
CREATE TABLE staff (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, color TEXT NOT NULL DEFAULT '#6EC5FF', is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX idx_staff_email ON staff(email);

CREATE TABLE consultation_types (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 30, is_active BOOLEAN NOT NULL DEFAULT true, display_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX idx_consultation_types_display_order ON consultation_types(display_order);

CREATE TABLE bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), status TEXT NOT NULL DEFAULT 'confirmed', start_time TIMESTAMPTZ NOT NULL, end_time TIMESTAMPTZ NOT NULL, duration_minutes INTEGER NOT NULL DEFAULT 30, staff_id UUID NOT NULL REFERENCES staff(id), consultation_type_id UUID NOT NULL REFERENCES consultation_types(id), client_name TEXT NOT NULL, client_email TEXT NOT NULL, client_company TEXT, client_memo TEXT, is_recent BOOLEAN NOT NULL DEFAULT false, google_event_id TEXT, google_meet_link TEXT, cancel_token TEXT NOT NULL UNIQUE, utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), cancelled_at TIMESTAMPTZ);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);

CREATE TABLE email_logs (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email_type TEXT NOT NULL, booking_id UUID REFERENCES bookings(id), to_email TEXT NOT NULL, from_email TEXT NOT NULL, subject TEXT NOT NULL, body_html TEXT, resend_id TEXT, is_sent BOOLEAN NOT NULL DEFAULT false, sent_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX idx_email_logs_booking_id ON email_logs(booking_id);
  `.trim()
}

createTablesAndData()
