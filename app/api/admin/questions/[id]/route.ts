/**
 * 質問個別操作API（管理者用）
 * PATCH: 質問更新
 * DELETE: 質問削除
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { } from "@/lib/supabase/database"
import { z } from "zod"

const updateQuestionSchema = z.object({
  question_text: z.string().min(1).max(500).optional(),
  question_type: z.enum(["text", "textarea", "radio", "checkbox", "select"]).optional(),
  options: z.array(z.string()).optional().nullable(),
  is_required: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
  placeholder: z.string().max(100).optional().nullable(),
  help_text: z.string().max(200).optional().nullable(),
})

/**
 * PATCH /api/admin/questions/[id]
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
    const validated = updateQuestionSchema.parse(body)

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Question not found" }, { status: 404 })
      }
      console.error("Failed to update question:", error)
      return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
    }

    return NextResponse.json({ question })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("PATCH /api/admin/questions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/questions/[id]
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

    const { error } = await supabaseAdmin.from("questions").delete().eq("id", params.id)

    if (error) {
      console.error("Failed to delete question:", error)
      return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/admin/questions/[id] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
