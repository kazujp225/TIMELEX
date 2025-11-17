import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 動的インポートでビルド時エラーを回避
    const { supabase } = await import("@/lib/supabase")

    const { id } = params

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        staff (*),
        consultation_type:consultation_types (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Failed to fetch booking:", error)
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
