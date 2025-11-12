#!/usr/bin/env node
/**
 * Supabase MCPサーバー経由でテーブルを作成
 */
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🚀 Supabase MCP経由でテーブル作成開始...\n')
console.log('📡 接続先:', SUPABASE_URL)
console.log('')

// SQLファイルを読み込み
const sqlPath = path.join(__dirname, '..', 'supabase', 'EXECUTE_THIS.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

// コメント行を除去してクリーンなSQLに
const cleanSQL = sql
  .split('\n')
  .filter(line => {
    const trimmed = line.trim()
    return trimmed !== '' && !trimmed.startsWith('--')
  })
  .join('\n')

// Supabase CLIを使ってSQL実行
console.log('📝 SQL実行中...\n')

// npx経由でsupabase-mcpを使用
const mcp = spawn('npx', [
  'supabase-mcp',
  'execute',
  '--url', SUPABASE_URL,
  '--key', SUPABASE_SERVICE_KEY,
  '--sql', cleanSQL
], {
  env: {
    ...process.env,
    SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY
  }
})

let output = ''
let errorOutput = ''

mcp.stdout.on('data', (data) => {
  const str = data.toString()
  output += str
  process.stdout.write(str)
})

mcp.stderr.on('data', (data) => {
  const str = data.toString()
  errorOutput += str
  process.stderr.write(str)
})

mcp.on('close', async (code) => {
  if (code === 0) {
    console.log('\n✅ テーブル作成完了！\n')

    // Supabase JS SDKで確認
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    console.log('🔍 データ確認中...\n')

    const { data: staff } = await supabase.from('staff').select('*')
    console.log(`✅ スタッフ: ${staff?.length || 0}件`)
    if (staff && staff.length > 0) {
      staff.forEach(s => console.log(`   - ${s.name} (${s.email})`))
    }

    const { data: types } = await supabase.from('consultation_types').select('*').order('display_order')
    console.log(`\n✅ 商材: ${types?.length || 0}件`)
    if (types && types.length > 0) {
      types.forEach(t => console.log(`   - ${t.name} (${t.duration_minutes}分)`))
    }

    console.log('\n🎉 全て完了！Supabaseデータベースの準備が整いました！')
  } else {
    console.error(`\n❌ エラーが発生しました（終了コード: ${code}）`)

    // エラーが出た場合は、直接Supabase JS SDKで実行
    console.log('\n代替方法: Supabase JS SDK経由で実行します...\n')

    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try {
      // RPC関数を使ってSQLを実行
      const { error } = await supabase.rpc('exec_sql', { sql: cleanSQL })

      if (error) {
        console.error('❌ SDK実行もエラー:', error.message)
        console.log('\n⚠️  手動実行が必要です:')
        console.log('https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
      } else {
        console.log('✅ SDK経由で実行成功！')
      }
    } catch (err) {
      console.error('❌ 例外:', err.message)
      console.log('\n⚠️  手動実行が必要です:')
      console.log('https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
    }
  }
})
