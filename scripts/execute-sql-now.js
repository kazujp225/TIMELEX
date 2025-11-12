#!/usr/bin/env node
/**
 * SupabaseにSQLを自動実行（完全自動版）
 * Supabase Project Reference IDから自動的に接続情報を構築
 */
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

// Supabase接続情報
const SUPABASE_PROJECT_REF = 'jvwdeartscnskwskubek'
const SUPABASE_PASSWORD = process.env.SUPABASE_DB_PASSWORD || '' // 後で設定

// PostgreSQL接続URL構築
const connectionString = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_PASSWORD}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres`

async function executeSQLFile() {
  console.log('🚀 Supabase SQL自動実行開始...\n')

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('📡 Supabaseに接続中...')
    await client.connect()
    console.log('✅ 接続成功！\n')

    // SQLファイル読み込み
    const sqlPath = path.join(__dirname, '..', 'supabase', 'EXECUTE_THIS.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // コメント行を除去
    const cleanSQL = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')

    console.log('📝 SQL実行中...\n')
    const result = await client.query(cleanSQL)

    console.log('✅ SQL実行完了！\n')
    console.log('📊 結果:')
    console.log(result.rows)

    // データ確認
    console.log('\n🔍 データ確認中...\n')

    const staffResult = await client.query('SELECT COUNT(*) as count FROM staff')
    console.log(`✅ スタッフ: ${staffResult.rows[0].count}件`)

    const typesResult = await client.query('SELECT COUNT(*) as count FROM consultation_types')
    console.log(`✅ 商材: ${typesResult.rows[0].count}件`)

    const bookingsResult = await client.query('SELECT COUNT(*) as count FROM bookings')
    console.log(`✅ 予約: ${bookingsResult.rows[0].count}件`)

    console.log('\n🎉 全て完了！Supabaseデータベースの準備が整いました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message)

    if (error.message.includes('password')) {
      console.log('\n⚠️  データベースパスワードが必要です。')
      console.log('以下の手順でパスワードを取得してください：')
      console.log('1. https://supabase.com/dashboard/project/jvwdeartscnskwskubek/settings/database')
      console.log('2. "Database password" をコピー')
      console.log('3. 以下のコマンドで設定：')
      console.log('   export SUPABASE_DB_PASSWORD="YOUR_PASSWORD"')
      console.log('   node scripts/execute-sql-now.js')
    }
  } finally {
    await client.end()
  }
}

executeSQLFile()
