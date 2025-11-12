#!/usr/bin/env node

/**
 * SupabaseにSQLを自動実行（PostgreSQL直接接続）
 */

const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL が設定されていません')
  process.exit(1)
}

// Supabase URLからプロジェクトIDを抽出
// 例: https://jvwdeartscnskwskubek.supabase.co -> jvwdeartscnskwskubek
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Supabase URLが不正です')
  process.exit(1)
}

// PostgreSQL接続文字列を構築
// Supabaseのデフォルトポート: 5432
// デフォルトDB: postgres
const connectionString = `postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

console.log('🚀 SQL自動実行スクリプト\n')
console.log('📊 プロジェクトID:', projectRef)
console.log('')

// SQLファイルを読み込み
const sqlFilePath = path.join(__dirname, '..', 'supabase', 'EXECUTE_THIS.sql')
const sql = fs.readFileSync(sqlFilePath, 'utf8')

console.log('📝 実行するSQL:')
console.log('  - テーブル数: 4個')
console.log('  - スタッフ: 2名')
console.log('  - 商材: 6種類')
console.log('')

// Supabase REST APIでDatabase Passwordが必要
console.log('⚠️  PostgreSQL接続にはデータベースパスワードが必要です')
console.log('')
console.log('📋 以下の方法でパスワードを取得してください:')
console.log('1. Supabaseダッシュボード → Settings → Database')
console.log('2. "Connection string" セクションの "Password" をコピー')
console.log('')
console.log('または、以下のコマンドで環境変数に設定:')
console.log(`export SUPABASE_DB_PASSWORD="your-password"`)
console.log('')

const dbPassword = process.env.SUPABASE_DB_PASSWORD

if (!dbPassword) {
  console.log('❌ SUPABASE_DB_PASSWORD が設定されていません')
  console.log('')
  console.log('🔧 代替案: Supabase JavaScript SDKでテーブル作成を試みます...')
  console.log('')

  // REST APIで初期データだけ投入
  executeFallback()
} else {
  // PostgreSQL直接接続で実行
  executeWithPostgres(dbPassword)
}

async function executeWithPostgres(password) {
  const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('🔌 PostgreSQLに接続中...')
    await client.connect()
    console.log('✅ 接続成功\n')

    console.log('📝 SQLを実行中...')
    await client.query(sql)
    console.log('✅ SQL実行完了\n')

    // 確認
    const staffResult = await client.query('SELECT COUNT(*) FROM staff')
    const typesResult = await client.query('SELECT COUNT(*) FROM consultation_types')

    console.log('📊 結果確認:')
    console.log(`  スタッフ: ${staffResult.rows[0].count}件`)
    console.log(`  相談種別: ${typesResult.rows[0].count}件`)
    console.log('')
    console.log('🎉 データベースセットアップ完了！')

  } catch (error) {
    console.error('❌ エラー:', error.message)
    console.log('')
    console.log('💡 手動実行が必要です:')
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
  } finally {
    await client.end()
  }
}

async function executeFallback() {
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // スタッフデータ投入
    console.log('📌 スタッフデータを投入中...')
    const { error: staffError } = await supabase
      .from('staff')
      .insert([
        { name: '担当者A', email: 'staff-a@zettai.co.jp', color: '#6EC5FF' },
        { name: '担当者B', email: 'staff-b@zettai.co.jp', color: '#FFC870' }
      ])

    if (staffError) {
      if (staffError.code === '42P01') {
        throw new Error('テーブルが存在しません。手動でSQLを実行してください。')
      }
      if (staffError.code !== '23505') {
        throw staffError
      }
      console.log('   ✅ スタッフデータは既に存在します')
    } else {
      console.log('   ✅ スタッフデータ投入完了')
    }

    // 相談種別データ投入
    console.log('📌 相談種別データを投入中...')
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

    if (typesError && typesError.code !== '23505') {
      throw typesError
    }
    console.log('   ✅ 相談種別データ投入完了')

    console.log('\n🎉 初期データ投入完了！')
    console.log('\n⚠️  テーブル作成は手動で実行してください:')
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new')

  } catch (error) {
    console.error('\n❌ エラー:', error.message)
    console.log('\n💡 Supabaseダッシュボードで手動実行が必要です:')
    console.log('https://supabase.com/dashboard/project/' + projectRef + '/sql/new')
    console.log('\nSQL: supabase/EXECUTE_THIS.sql')
  }
}
