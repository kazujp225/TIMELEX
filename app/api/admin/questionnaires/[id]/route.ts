/**
 * アンケート個別操作API（管理者用）
 * GET: アンケート詳細取得
 * PATCH: アンケート更新
 * DELETE: アンケート削除
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { } from "@/lib/supabase/database"
import { z } from "zod"

const updateQuestionnaireSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  consultation_type_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
})

/**
 * GET /api/admin/questionnaires/[id]
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data: questionnaire, error } = await supabaseAdmin
      .from("questionnaires")
      .select(
        `
        *,
        consultation_type:consultation_types(id, name),
        questions(*)
      `
      )
      .eq("id", params.id)
      .order("display_order", { foreignTable: "questions", ascending: true })
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 })
      }
      console.error("Failed to fetch questionnaire:", error)
      return NextResponse.json({ error: "Failed to fetch questionnaire" }, { status: 500 })
    }

    return NextResponse.json({ questionnaire })
  } catch (error) {
    console.error("GET /api/admin/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/questionnaires/[id]
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateQuestionnaireSchema.parse(body)

    const { data: questionnaire, error } = await supabaseAdmin
      .from("questionnaires")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 })
      }
      console.error("Failed to update questionnaire:", error)
      return NextResponse.json({ error: "Failed to update questionnaire" }, { status: 500 })
    }

    return NextResponse.json({ questionnaire })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("PATCH /api/admin/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/questionnaires/[id]
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabaseAdmin.from("questionnaires").delete().eq("id", params.id)

    if (error) {
      console.error("Failed to delete questionnaire:", error)
      return NextResponse.json({ error: "Failed to delete questionnaire" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
