import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { z } from "zod"

const questionSchema = z.object({
  question_text: z.string().min(1),
  question_type: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
  options: z.array(z.string()).optional(),
  is_required: z.boolean(),
  order_index: z.number(),
})

const questionsBodySchema = z.object({
  questions: z.array(questionSchema),
})

/**
 * POST /api/admin/products/[id]/questions
 * 商材の質問を一括作成/更新
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // スタッフ確認
    const { data: staff } = await supabaseAdmin
      .from("staff")
      .select("id")
      .eq("email", session.user.email)
      .single()

    if (!staff) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = questionsBodySchema.parse(body)

    // 既存の質問を削除
    await supabaseAdmin
      .from("product_questions")
      .delete()
      .eq("product_id", params.id)

    // 新しい質問を作成
    if (validated.questions.length > 0) {
      const questionsToInsert = validated.questions.map((q) => ({
        product_id: params.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options && q.options.length > 0 ? q.options : null,
        is_required: q.is_required,
        order_index: q.order_index,
      }))

      const { error } = await supabaseAdmin
        .from("product_questions")
        .insert(questionsToInsert)

      if (error) {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating questions:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
