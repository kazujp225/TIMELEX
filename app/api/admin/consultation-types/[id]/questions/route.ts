import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/client"
import { z } from "zod"

const questionSchema = z.object({
  question_text: z.string().min(1),
  question_type: z.enum(["text", "textarea", "radio", "checkbox", "select"]),
  options: z.array(z.string()).default([]),
  is_required: z.boolean().default(false),
  order_index: z.number().int().min(0),
})

const createQuestionsSchema = z.object({
  questions: z.array(questionSchema),
})

/**
 * POST /api/admin/consultation-types/:id/questions
 * 相談種別に紐づく質問を一括作成
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // バリデーション
    const validated = createQuestionsSchema.parse(body)

    // 相談種別が存在するか確認
    const { data: consultationType, error: typeError } = await supabaseAdmin
      .from("consultation_types")
      .select("id")
      .eq("id", params.id)
      .single()

    if (typeError || !consultationType) {
      return NextResponse.json(
        { error: "Consultation type not found" },
        { status: 404 }
      )
    }

    // 質問を一括作成
    const questionsToInsert = validated.questions.map((q) => ({
      consultation_type_id: params.id,
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options,
      is_required: q.is_required,
      order_index: q.order_index,
    }))

    const { data: createdQuestions, error: insertError } = await supabaseAdmin
      .from("product_questions")
      .insert(questionsToInsert)
      .select()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({ questions: createdQuestions }, { status: 201 })
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

/**
 * GET /api/admin/consultation-types/:id/questions
 * 相談種別に紐づく質問を全件取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: questions, error } = await supabaseAdmin
      .from("product_questions")
      .select("*")
      .eq("consultation_type_id", params.id)
      .order("order_index", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch questions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
