#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvwdeartscnskwskubek.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2d2RlYXJ0c2Nuc2t3c2t1YmVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk1MDgzOSwiZXhwIjoyMDc4NTI2ODM5fQ.OpkSrQn6ibjxhUoAqyYaNAbfwB2ymOf2neqqr4M_kKw'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 staffテーブルを確認中...\n')

const { data: staff, error } = await supabase
  .from('staff')
  .select('*')

if (error) {
  console.error('❌ エラー:', error.message)
  process.exit(1)
}

if (!staff || staff.length === 0) {
  console.log('⚠️  staffテーブルにスタッフが登録されていません')
  console.log('\nスタッフを追加するには、以下のSQLを実行してください:')
  console.log('\nINSERT INTO public.staff (name, email, google_calendar_id)')
  console.log("VALUES ('管理者', 'your-email@example.com', 'your-email@example.com');")
} else {
  console.log(`✅ ${staff.length}人のスタッフが登録されています:\n`)
  staff.forEach((s, i) => {
    console.log(`${i + 1}. ${s.name} (${s.email})`)
    console.log(`   ID: ${s.id}`)
    console.log(`   Calendar: ${s.google_calendar_id}`)
    console.log()
  })
}
