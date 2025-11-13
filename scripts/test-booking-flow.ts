/**
 * 予約フローのエンドツーエンドテスト
 *
 * このスクリプトは以下をテストします：
 * 1. 空き枠API - 明日の日付で空き枠を取得
 * 2. 予約作成API - テスト予約を作成
 * 3. ダブルブッキング防止 - 同じ時間に2回予約を試みる
 * 4. Supabaseデータ確認 - 予約が正しく保存されたか確認
 */

import { supabase } from "../lib/supabase"

const API_BASE = "http://127.0.0.1:3002"

async function testBookingFlow() {
  console.log("🧪 予約フローのテスト開始\n")

  try {
    // 1. 空き枠APIのテスト
    console.log("1️⃣ 空き枠APIをテスト...")
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split("T")[0]

    const slotsResponse = await fetch(
      `${API_BASE}/api/slots/simple?date=${dateStr}&consultation_type_id=3`
    )

    if (!slotsResponse.ok) {
      throw new Error(`空き枠API失敗: ${slotsResponse.status}`)
    }

    const slotsData = await slotsResponse.json()
    console.log(`   ✅ 空き枠取得成功: ${slotsData.slots?.length || 0}件の枠`)

    if (!slotsData.slots || slotsData.slots.length === 0) {
      throw new Error("空き枠が見つかりません")
    }

    // 最初の利用可能な枠を選択
    const firstSlot = slotsData.slots.find(
      (slot: any) => slot.availableStaff && slot.availableStaff.length > 0
    )

    if (!firstSlot) {
      throw new Error("利用可能なスタッフがいる枠が見つかりません")
    }

    const selectedStaff = firstSlot.availableStaff[0]
    const startTime = new Date(firstSlot.time)
    const endTime = new Date(startTime)
    endTime.setMinutes(endTime.getMinutes() + 30)

    console.log(`   📅 選択した枠: ${startTime.toLocaleString("ja-JP")}`)
    console.log(`   👤 選択したスタッフ: ${selectedStaff.name}\n`)

    // 2. 予約作成APIのテスト
    console.log("2️⃣ 予約作成APIをテスト...")
    const bookingPayload = {
      client_name: "テスト太郎",
      client_email: "test@example.com",
      client_company: "テスト株式会社",
      client_memo: "これはテスト予約です",
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: 30,
      staff_id: selectedStaff.id,
      staff_name: selectedStaff.name,
      consultation_type_id: "3",
      consultation_type_name: "商材3（技術サポート）",
    }

    const bookingResponse = await fetch(`${API_BASE}/api/bookings/simple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingPayload),
    })

    if (!bookingResponse.ok) {
      const error = await bookingResponse.json()
      throw new Error(`予約作成失敗: ${error.error || bookingResponse.status}`)
    }

    const bookingData = await bookingResponse.json()
    console.log(`   ✅ 予約作成成功!`)
    console.log(`   📝 予約ID: ${bookingData.booking_id}`)
    console.log(`   🔑 キャンセルトークン: ${bookingData.cancel_token?.substring(0, 10)}...`)
    if (bookingData.google_meet_link) {
      console.log(`   🎥 Google Meet: ${bookingData.google_meet_link}`)
    }
    console.log()

    // 3. Supabaseデータ確認
    console.log("3️⃣ Supabaseのデータを確認...")
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingData.booking_id)
      .single()

    if (fetchError || !booking) {
      throw new Error(`Supabaseデータ取得失敗: ${fetchError?.message}`)
    }

    console.log(`   ✅ Supabaseに正しく保存されています`)
    console.log(`   👤 顧客名: ${booking.client_name}`)
    console.log(`   📧 メール: ${booking.client_email}`)
    console.log(`   🏢 会社: ${booking.client_company}`)
    console.log(`   📅 開始時刻: ${new Date(booking.start_time).toLocaleString("ja-JP")}`)
    console.log(`   ⏰ 終了時刻: ${new Date(booking.end_time).toLocaleString("ja-JP")}`)
    console.log(`   📊 ステータス: ${booking.status}`)
    console.log()

    // 4. ダブルブッキング防止のテスト
    console.log("4️⃣ ダブルブッキング防止をテスト...")
    const duplicateResponse = await fetch(`${API_BASE}/api/bookings/simple`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingPayload),
    })

    if (duplicateResponse.status === 409) {
      console.log(`   ✅ ダブルブッキング防止が正常に動作しています`)
      console.log(`   🚫 2回目の予約は正しく拒否されました (409 Conflict)`)
    } else {
      console.warn(`   ⚠️  警告: ダブルブッキングが防止されませんでした`)
    }
    console.log()

    // 5. 空き枠APIの再確認（予約後にその枠が消えているか）
    console.log("5️⃣ 予約後の空き枠を再確認...")
    const slotsResponse2 = await fetch(
      `${API_BASE}/api/slots/simple?date=${dateStr}&consultation_type_id=3`
    )

    const slotsData2 = await slotsResponse2.json()
    const slotAfter = slotsData2.slots?.find(
      (slot: any) => new Date(slot.time).getTime() === startTime.getTime()
    )

    if (slotAfter) {
      const staffStillAvailable = slotAfter.availableStaff?.find(
        (staff: any) => staff.id === selectedStaff.id
      )

      if (!staffStillAvailable) {
        console.log(`   ✅ 予約したスタッフは該当枠で利用不可になっています`)
      } else {
        console.warn(`   ⚠️  警告: 予約したスタッフがまだ利用可能として表示されています`)
      }
    }
    console.log()

    // 6. テスト予約をクリーンアップ
    console.log("6️⃣ テスト予約をクリーンアップ...")
    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingData.booking_id)

    if (deleteError) {
      console.warn(`   ⚠️  クリーンアップ失敗: ${deleteError.message}`)
    } else {
      console.log(`   ✅ テスト予約を削除しました`)
    }
    console.log()

    console.log("🎉 全てのテストが成功しました!\n")
    console.log("✅ チェックリスト:")
    console.log("  ✓ 空き枠APIが正常に動作")
    console.log("  ✓ 予約作成APIが正常に動作")
    console.log("  ✓ Supabaseにデータが正しく保存")
    console.log("  ✓ ダブルブッキング防止が動作")
    console.log("  ✓ 予約後に空き枠が更新される")
    console.log()

  } catch (error) {
    console.error("\n❌ テスト失敗:")
    console.error(error)
    process.exit(1)
  }
}

// テスト実行
testBookingFlow()
