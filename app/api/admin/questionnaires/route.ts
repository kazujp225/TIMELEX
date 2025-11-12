/**
 * アンケート管理API（管理者用）
 * GET: アンケート一覧取得
 * POST: アンケート新規作成
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { } from "@/lib/supabase/database"
import { z } from "zod"

const createQuestionnaireSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  consultation_type_id: z.string().uuid().optional().nullable(),
  display_order: z.number().int().min(0).default(0),
})

/**
 * GET /api/admin/questionnaires
 * アンケート一覧取得（質問付き）
 */
export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 管理者権限チェック（簡易版: スタッフテーブルに存在すればOK）
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // アンケート一覧取得（質問も含む）
    const { data: questionnaires, error } = await supabaseAdmin
      .from("questionnaires")
      .select(
        `
        *,
        consultation_type:consultation_types(id, name),
        questions(*)
      `
      )
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Failed to fetch questionnaires:", error)
      return NextResponse.json({ error: "Failed to fetch questionnaires" }, { status: 500 })
    }

    return NextResponse.json({ questionnaires })
  } catch (error) {
    console.error("GET /api/admin/questionnaires error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/admin/questionnaires
 * アンケート新規作成
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 管理者権限チェック
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // リクエストボディのバリデーション
    const body = await request.json()
    const validated = createQuestionnaireSchema.parse(body)

    // アンケート作成
    const { data: questionnaire, error } = await supabaseAdmin
      .from("questionnaires")
      .insert({
        name: validated.name,
        description: validated.description,
        consultation_type_id: validated.consultation_type_id,
        display_order: validated.display_order,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create questionnaire:", error)
      return NextResponse.json({ error: "Failed to create questionnaire" }, { status: 500 })
    }

    return NextResponse.json({ questionnaire }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("POST /api/admin/questionnaires error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
