import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Supabase credentials are missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const newStaff = [
  { name: "小潟", email: "ogata@zettai.co.jp" },
  { name: "藤田", email: "fujita@zettai.co.jp" },
  { name: "藤原", email: "fujiwara@zettai.co.jp" },
  { name: "高階", email: "takashina@zettai.co.jp" },
  { name: "フジショー", email: "fujisho@zettai.co.jp" },
]

async function updateStaff() {
  console.log("🔄 Updating staff names...")

  // 既存のスタッフを確認
  const { data: existingStaff, error: fetchError } = await supabase
    .from("staff")
    .select("*")
    .order("created_at")

  if (fetchError) {
    console.error("❌ Failed to fetch staff:", fetchError)
    return
  }

  console.log(`\n📋 Current staff (${existingStaff?.length || 0}):`)
  existingStaff?.forEach((staff) => {
    console.log(`  - ${staff.name} (${staff.email})`)
  })

  // 既存のスタッフを更新または新規追加
  const staffToUpdate = existingStaff?.slice(0, newStaff.length) || []
  const staffToAdd = newStaff.slice(staffToUpdate.length)
  const staffToDeactivate = existingStaff?.slice(newStaff.length) || []

  // 既存のスタッフを更新
  for (let i = 0; i < staffToUpdate.length; i++) {
    const { error } = await supabase
      .from("staff")
      .update({
        name: newStaff[i].name,
        email: newStaff[i].email,
        is_active: true,
      })
      .eq("id", staffToUpdate[i].id)

    if (error) {
      console.error(`❌ Failed to update staff ${newStaff[i].name}:`, error)
    } else {
      console.log(`✅ Updated: ${staffToUpdate[i].name} → ${newStaff[i].name}`)
    }
  }

  // 不足分を新規追加
  if (staffToAdd.length > 0) {
    const { data: insertedStaff, error: insertError } = await supabase
      .from("staff")
      .insert(
        staffToAdd.map((staff) => ({
          name: staff.name,
          email: staff.email,
          is_active: true,
        }))
      )
      .select()

    if (insertError) {
      console.error("❌ Failed to insert staff:", insertError)
    } else {
      console.log(`\n✅ Added ${insertedStaff?.length || 0} new staff members:`)
      insertedStaff?.forEach((staff) => {
        console.log(`  - ${staff.name} (${staff.email})`)
      })
    }
  }

  // 余分なスタッフを非アクティブ化
  if (staffToDeactivate.length > 0) {
    for (const staff of staffToDeactivate) {
      const { error } = await supabase
        .from("staff")
        .update({ is_active: false })
        .eq("id", staff.id)

      if (error) {
        console.error(`❌ Failed to deactivate staff ${staff.name}:`, error)
      } else {
        console.log(`🔒 Deactivated: ${staff.name}`)
      }
    }
  }

  // 最終結果を表示（アクティブなスタッフのみ）
  const { data: finalStaff } = await supabase
    .from("staff")
    .select("*")
    .eq("is_active", true)
    .order("created_at")

  console.log(`\n📋 Active staff list (${finalStaff?.length || 0}):`)
  finalStaff?.forEach((staff) => {
    console.log(`  - ${staff.name} (${staff.email})`)
  })
}

updateStaff()
  .then(() => {
    console.log("\n✨ Staff update complete!")
    process.exit(0)
  })
  .catch((error) => {
    console.error("❌ Error:", error)
    process.exit(1)
  })
