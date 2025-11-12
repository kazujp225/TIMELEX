import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { staffDb } from "@/lib/supabase/database"
import { z } from "zod"

const updateStaffSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  email: z.string().email().max(100).transform(val => val.toLowerCase()).optional(),
  timezone: z.string().optional(),
  is_active: z.boolean().optional(),
})

/**
 * GET /api/admin/staff/:id
 * スタッフ詳細を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Check if user has admin role

    const staff = await staffDb.getById(params.id)

    if (!staff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      )
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
 * PATCH /api/admin/staff/:id
 * スタッフを更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validated = updateStaffSchema.parse(body)

    // メールアドレス変更時の重複チェック
    if (validated.email) {
      const existing = await staffDb.getByEmail(validated.email)
      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: "このメールアドレスは既に使用されています" },
          { status: 400 }
        )
      }
    }

    // スタッフを更新
    const { data: updatedStaff, error } = await supabaseAdmin
      .from("staff")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!updatedStaff) {
      return NextResponse.json(
        { error: "Staff not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ staff: updatedStaff })
  } catch (error) {
    console.error("Error updating staff:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update staff",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/staff/:id
 * スタッフを削除（論理削除: is_activeをfalseに設定）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // TODO: Check if user has admin role

    // 論理削除（is_activeをfalseに設定）
    const { error } = await supabaseAdmin
      .from("staff")
      .update({ is_active: false })
      .eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Staff deleted successfully" })
  } catch (error) {
    console.error("Error deleting staff:", error)
    return NextResponse.json(
      {
        error: "Failed to delete staff",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
