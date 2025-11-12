#!/usr/bin/env node
/**
 * Supabase Management API経由でSQLを実行
 * アクセストークン: sbp_a3fb7649e23796697780007d5175bb1a2893c47e
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

const ACCESS_TOKEN = 'sbp_a3fb7649e23796697780007d5175bb1a2893c47e'
const PROJECT_REF = 'jvwdeartscnskwskubek'

console.log('🚀 Supabase Management API経由でSQL実行開始...\n')

// SQLファイルを読み込み
const sqlPath = path.join(__dirname, '..', 'supabase', 'EXECUTE_THIS.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

// Management APIのSQLエンドポイント
const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${PROJECT_REF}/database/query`,
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  }
}

const data = JSON.stringify({ query: sql })

console.log('📡 APIリクエスト送信中...\n')

const req = https.request(options, (res) => {
  let responseData = ''

  res.on('data', (chunk) => {
    responseData += chunk
  })

  res.on('end', () => {
    console.log(`📊 ステータスコード: ${res.statusCode}\n`)

    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ SQL実行成功！\n')
      console.log('レスポンス:', responseData)

      // 確認スクリプトを実行
      const { spawn } = require('child_process')
      const check = spawn('node', [path.join(__dirname, 'check-current-state.js')])

      check.stdout.on('data', (data) => process.stdout.write(data.toString()))
      check.stderr.on('data', (data) => process.stderr.write(data.toString()))

      check.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 テーブル作成完了！')
        }
      })
    } else {
      console.error('❌ エラーが発生しました\n')
      console.error('ステータス:', res.statusCode)
      console.error('レスポンス:', responseData)

      try {
        const error = JSON.parse(responseData)
        console.error('\nエラー詳細:', error)
      } catch (e) {
        // JSON parse error
      }

      console.log('\n代替方法: 手動でSQLを実行してください')
      console.log('https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
    }
  })
})

req.on('error', (error) => {
  console.error('❌ リクエストエラー:', error.message)
  console.log('\n代替方法: 手動でSQLを実行してください')
  console.log('https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new')
})

req.write(data)
req.end()
