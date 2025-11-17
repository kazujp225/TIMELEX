import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { z } from "zod"

const createConsultationTypeSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  duration_minutes: z.number().int().min(1).max(480).default(30),
  buffer_before_minutes: z.number().int().min(0).max(60).default(5),
  buffer_after_minutes: z.number().int().min(0).max(60).default(5),
  display_order: z.number().int().min(0).default(0),
  google_meet_url: z
    .string()
    .url()
    .regex(/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/, {
      message: "Invalid Google Meet URL format. Expected: https://meet.google.com/xxx-xxxx-xxx",
    })
    .optional()
    .nullable(),
})

/**
 * GET /api/admin/consultation-types
 * 全相談種別を取得（管理者用）
 */
export async function GET(_request: NextRequest) {
  try {
    // 全相談種別を取得（アクティブ・非アクティブ両方）
    const { data: consultationTypes, error } = await supabaseAdmin
      .from("consultation_types")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ consultationTypes })
  } catch (error) {
    console.error("Error fetching consultation types:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch consultation types",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/consultation-types
 * 相談種別を作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // バリデーション
    const validated = createConsultationTypeSchema.parse(body)

    // 相談種別を作成
    const { data: newType, error } = await supabaseAdmin
      .from("consultation_types")
      .insert({
        ...validated,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // 予約URLを自動生成
    const { error: urlError } = await supabaseAdmin
      .from("booking_urls")
      .insert({
        consultation_type_id: newType.id,
        url_path: newType.id, // IDをそのままURL pathとして使用
        is_active: true,
      })

    if (urlError) {
      console.error("Failed to create booking URL:", urlError)
      // URLの作成に失敗してもエラーにはしない（商材は作成済み）
    }

    return NextResponse.json({ consultationType: newType }, { status: 201 })
  } catch (error) {
    console.error("Error creating consultation type:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create consultation type",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
