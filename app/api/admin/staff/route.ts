import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { staffDb } from "@/lib/supabase/database"
import { z } from "zod"

const createStaffSchema = z.object({
  name: z.string().min(1).max(50),
  email: z.string().email().max(100).transform(val => val.toLowerCase()),
  timezone: z.string().default("Asia/Tokyo"),
})

/**
 * GET /api/admin/staff
 * 全スタッフを取得（管理者用）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Check if user has admin role

    // 全スタッフを取得（アクティブ・非アクティブ両方）
    const { data: staff, error } = await supabaseAdmin
      .from("staff")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ staff })
  } catch (error) {
    console.error("Error fetching staff:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch staff",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/staff
 * スタッフを作成
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Check if user has admin role

    const body = await request.json()

    // バリデーション
    const validated = createStaffSchema.parse(body)

    // メールアドレスの重複チェック
    const existing = await staffDb.getByEmail(validated.email)
    if (existing) {
      return NextResponse.json(
        { error: "このメールアドレスは既に登録されています" },
        { status: 400 }
      )
    }

    // スタッフを作成
    const { data: newStaff, error } = await supabaseAdmin
      .from("staff")
      .insert({
        name: validated.name,
        email: validated.email,
        timezone: validated.timezone,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ staff: newStaff }, { status: 201 })
  } catch (error) {
    console.error("Error creating staff:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create staff",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
