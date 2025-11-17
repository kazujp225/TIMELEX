import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/bookings/:id/cancel
 * 予約をキャンセル
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 動的インポートでビルド時エラーを回避
    const { supabase } = await import("@/lib/supabase")

    const { id } = params
    const body = await request.json()
    const { cancel_token } = body

    if (!cancel_token) {
      return NextResponse.json(
        { error: "キャンセルトークンが必要です" },
        { status: 400 }
      )
    }

    // 予約を取得してトークンを検証
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !booking) {
      console.error("Failed to fetch booking:", fetchError)
      return NextResponse.json(
        { error: "予約が見つかりません" },
        { status: 404 }
      )
    }

    // トークンを検証
    if (booking.cancel_token !== cancel_token) {
      return NextResponse.json(
        { error: "無効なキャンセルトークンです" },
        { status: 403 }
      )
    }

    // 既にキャンセル済みかチェック
    if (booking.status === "cancelled") {
      return NextResponse.json(
        { error: "この予約は既にキャンセル済みです" },
        { status: 400 }
      )
    }

    // 過去の予約かチェック
    const startTime = new Date(booking.start_time)
    if (startTime < new Date()) {
      return NextResponse.json(
        { error: "過去の予約はキャンセルできません" },
        { status: 400 }
      )
    }

    // 予約をキャンセル
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Failed to cancel booking:", updateError)
      return NextResponse.json(
        { error: "キャンセル処理に失敗しました" },
        { status: 500 }
      )
    }

    console.log(`✅ Booking cancelled: ${id}`)

    return NextResponse.json({
      success: true,
      message: "予約をキャンセルしました",
    })
  } catch (error) {
    console.error("Error cancelling booking:", error)
    return NextResponse.json(
      { error: "内部サーバーエラー" },
      { status: 500 }
    )
  }
}
