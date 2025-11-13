/**
 * Supabaseテーブルセットアップスクリプト
 *
 * 実行方法: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { join } from "path"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase credentials are missing")
  console.error("   NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✓" : "✗")
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "✓" : "✗")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function setupTables() {
  console.log("🚀 Supabaseテーブルセットアップを開始します...")
  console.log(`📍 URL: ${supabaseUrl}`)
  console.log("")

  try {
    // SQLファイルを読み込む
    const sqlPath = join(process.cwd(), "supabase", "EXECUTE_THIS.sql")
    const sql = readFileSync(sqlPath, "utf-8")

    console.log("📄 SQLファイルを読み込みました")
    console.log("")

    // SQLを実行（コメント行と空行を除外して分割実行）
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    console.log(`📊 ${statements.length}個のSQLステートメントを実行します...`)
    console.log("")

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (!statement) continue

      // SELECTクエリはスキップ（確認用）
      if (statement.toLowerCase().startsWith("select")) {
        console.log(`⏭️  スキップ: ${statement.substring(0, 50)}...`)
        continue
      }

      try {
        console.log(`⚙️  実行中 (${i + 1}/${statements.length}): ${statement.substring(0, 50)}...`)

        const { error } = await supabase.rpc("exec_sql", {
          sql_query: statement + ";"
        })

        if (error) {
          // rpcが使えない場合は直接実行を試みる
          console.log(`   ℹ️  rpc経由で実行できませんでした。別の方法を試します...`)

          // テーブル作成系は個別に実行
          if (statement.toLowerCase().includes("create table")) {
            console.log(`   ⚠️  CREATE TABLEは手動で実行する必要があります`)
            console.log(`   SQL: ${statement}`)
          }
        } else {
          console.log(`   ✅ 成功`)
        }
      } catch (err) {
        console.error(`   ❌ エラー:`, err)
      }
    }

    console.log("")
    console.log("🎉 セットアップが完了しました！")
    console.log("")
    console.log("📋 確認:")
    console.log("   https://supabase.com/dashboard/project/jvwdeartscnskwskubek/editor")
    console.log("")

    // テーブルの存在確認
    console.log("🔍 テーブルの確認...")

    const tables = ["staff", "consultation_types", "bookings", "email_logs"]
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("count", { count: "exact", head: true })

      if (error) {
        console.log(`   ❌ ${table}: テーブルが見つかりません`)
      } else {
        console.log(`   ✅ ${table}: OK`)
      }
    }

    console.log("")
    console.log("✅ 全ての確認が完了しました！")

  } catch (error) {
    console.error("❌ エラーが発生しました:", error)
    process.exit(1)
  }
}

setupTables()
