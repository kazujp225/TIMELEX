/**
 * Supabaseテーブルセットアップ（簡易版）
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function setup() {
  console.log("🚀 Supabaseセットアップ開始...")
  console.log("")

  // 1. スタッフテーブルの確認
  console.log("1️⃣ スタッフテーブルを確認...")
  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("*")
    .limit(5)

  if (staffError) {
    console.log("   ⚠️  テーブルが存在しません")
    console.log("   エラー:", staffError.message)
    console.log("")
    console.log("📝 次のURLでSQLを手動実行してください:")
    console.log("   https://supabase.com/dashboard/project/jvwdeartscnskwskubek/sql/new")
    console.log("")
    console.log("実行するSQL: supabase/EXECUTE_THIS.sql")
    process.exit(1)
  } else {
    console.log(`   ✅ OK (${staff?.length || 0}件のスタッフ)`)
    staff?.forEach((s: any) => {
      console.log(`      - ${s.name} (${s.email})`)
    })
  }

  // 2. 相談種別テーブルの確認
  console.log("")
  console.log("2️⃣ 相談種別テーブルを確認...")
  const { data: types, error: typesError } = await supabase
    .from("consultation_types")
    .select("*")
    .order("display_order")

  if (typesError) {
    console.log("   ⚠️  テーブルが存在しません")
    console.log("   エラー:", typesError.message)
  } else {
    console.log(`   ✅ OK (${types?.length || 0}件の商材)`)
    types?.forEach((t: any) => {
      console.log(`      - ${t.name} (${t.duration_minutes}分)`)
    })
  }

  // 3. 予約テーブルの確認
  console.log("")
  console.log("3️⃣ 予約テーブルを確認...")
  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("count", { count: "exact", head: true })

  if (bookingsError) {
    console.log("   ⚠️  テーブルが存在しません")
    console.log("   エラー:", bookingsError.message)
  } else {
    console.log(`   ✅ OK (0件の予約 - 空のテーブル)`)
  }

  console.log("")
  console.log("🎉 セットアップ確認完了！")
  console.log("")
  console.log("次のステップ:")
  console.log("  1. 予約フローをテスト")
  console.log("  2. 空き枠APIをテスト")
  console.log("")
}

setup().catch(console.error)
