import { NextResponse } from "next/server"

export async function DELETE() {
  try {
    // 動的インポートでビルド時エラーを回避
    const { supabase } = await import("@/lib/supabase")

    // 全ての予約を削除
    const { error } = await supabase
      .from("bookings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // 全削除（ダミー条件）

    if (error) {
      console.error("Failed to delete bookings:", error)
      return NextResponse.json(
        { error: "予約の削除に失敗しました" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "全ての予約を削除しました"
    })
  } catch (error) {
    console.error("Error deleting bookings:", error)
    return NextResponse.json(
      { error: "予約の削除中にエラーが発生しました" },
      { status: 500 }
    )
  }
}
