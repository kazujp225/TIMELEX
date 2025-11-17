#!/usr/bin/env node

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://jvwdeartscnskwskubek.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d2RlYXJ0c2Nuc2t3c2t1YmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1MDgzOSwiZXhwIjoyMDc4NTI2ODM5fQ.OpkSrQn6ibjxhUoAqyYaNAbfwB2ymOf2neqqr4M_kKw'

console.log('🚀 SQLファイルを読み込んでいます...\n')

const sqlFile = join(__dirname, '..', 'QUICK_SETUP.sql')
const sql = readFileSync(sqlFile, 'utf-8')

console.log('📡 Supabase Management APIに接続中...\n')

// Split SQL into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 ${statements.length}個のSQL文を実行します...\n`)

let successCount = 0
let errorCount = 0

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i] + ';'

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: statement })
    })

    if (response.ok) {
      successCount++
      console.log(`✅ [${i + 1}/${statements.length}] 実行成功`)
    } else {
      const error = await response.text()
      if (error.includes('already exists') || error.includes('does not exist')) {
        successCount++
        console.log(`⏭️  [${i + 1}/${statements.length}] スキップ (既存)`)
      } else {
        errorCount++
        console.log(`❌ [${i + 1}/${statements.length}] エラー:`, error.substring(0, 100))
      }
    }
  } catch (error) {
    errorCount++
    console.log(`❌ [${i + 1}/${statements.length}] 例外:`, error.message)
  }
}

console.log(`\n📊 実行結果:`)
console.log(`  成功: ${successCount}`)
console.log(`  エラー: ${errorCount}`)
console.log(`\n🎉 完了！\n`)
