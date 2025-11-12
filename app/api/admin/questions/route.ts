/**
 * 質問管理API（管理者用）
 * POST: 質問新規作成
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { } from "@/lib/supabase/database"
import { z } from "zod"

const createQuestionSchema = z.object({
  questionnaire_id: z.string().uuid(),
  question_text: z.string().min(1).max(500),
  question_type: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
  options: z.array(z.string()).optional().nullable(),
  is_required: z.boolean().default(false),
  display_order: z.number().int().min(0).default(0),
  placeholder: z.string().max(100).optional().nullable(),
  help_text: z.string().max(200).optional().nullable(),
})

/**
 * POST /api/admin/questions
 * 質問新規作成
 */
export async function POST(request: NextRequest) {
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
    const validated = createQuestionSchema.parse(body)

    // radio/checkbox/selectの場合、optionsが必須
    if (
      ["radio", "checkbox", "select"].includes(validated.question_type) &&
      (!validated.options || validated.options.length === 0)
    ) {
      return NextResponse.json(
        { error: "Options are required for radio, checkbox, and select types" },
        { status: 400 }
      )
    }

    const { data: question, error } = await supabaseAdmin
      .from("questions")
      .insert({
        questionnaire_id: validated.questionnaire_id,
        question_text: validated.question_text,
        question_type: validated.question_type,
        options: validated.options,
        is_required: validated.is_required,
        display_order: validated.display_order,
        placeholder: validated.placeholder,
        help_text: validated.help_text,
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to create question:", error)
      return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
    }

    return NextResponse.json({ question }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("POST /api/admin/questions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
