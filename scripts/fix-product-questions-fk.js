#!/usr/bin/env node

/**
 * product_questionsテーブルの外部キー制約を修正するスクリプト
 * product_idがconsultation_typesを参照するように変更
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixForeignKey() {
  console.log('🔧 Fixing product_questions foreign key constraint...\n')

  try {
    // Step 1: 既存の外部キー制約を削除
    console.log('Step 1: Dropping existing foreign key constraint...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE product_questions
        DROP CONSTRAINT IF EXISTS product_questions_product_id_fkey;
      `
    })

    if (dropError) {
      console.log('Note: Could not drop constraint (might not exist):', dropError.message)
    } else {
      console.log('✅ Dropped existing constraint')
    }

    // Step 2: 新しい外部キー制約を追加
    console.log('\nStep 2: Adding new foreign key constraint (referencing consultation_types)...')
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE product_questions
        ADD CONSTRAINT product_questions_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES consultation_types(id)
        ON DELETE CASCADE;
      `
    })

    if (addError) {
      throw addError
    }

    console.log('✅ Added new foreign key constraint\n')
    console.log('✨ Successfully fixed foreign key constraint!')
    console.log('   product_questions.product_id now references consultation_types(id)\n')

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Details:', error)

    console.log('\n📝 Please execute this SQL manually in Supabase Dashboard > SQL Editor:')
    console.log(`
-- 既存の外部キー制約を削除
ALTER TABLE product_questions
  DROP CONSTRAINT IF EXISTS product_questions_product_id_fkey;

-- 新しい外部キー制約を追加（consultation_typesを参照）
ALTER TABLE product_questions
  ADD CONSTRAINT product_questions_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES consultation_types(id)
  ON DELETE CASCADE;
    `)
    process.exit(1)
  }
}

fixForeignKey()
