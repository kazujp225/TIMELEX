import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { consultationTypeDb } from "@/lib/supabase/database"
import { z } from "zod"

const updateConsultationTypeSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  duration_minutes: z.number().int().min(1).max(480).optional(),
  buffer_before_minutes: z.number().int().min(0).max(60).optional(),
  buffer_after_minutes: z.number().int().min(0).max(60).optional(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
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
 * GET /api/admin/consultation-types/:id
 * 相談種別詳細を取得
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

    const consultationType = await consultationTypeDb.getById(params.id)

    if (!consultationType) {
      return NextResponse.json(
        { error: "Consultation type not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ consultationType })
  } catch (error) {
    console.error("Error fetching consultation type:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch consultation type",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/consultation-types/:id
 * 相談種別を更新
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

    const body = await request.json()

    // バリデーション
    const validated = updateConsultationTypeSchema.parse(body)

    // 相談種別を更新
    const { data: updatedType, error } = await supabaseAdmin
      .from("consultation_types")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!updatedType) {
      return NextResponse.json(
        { error: "Consultation type not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ consultationType: updatedType })
  } catch (error) {
    console.error("Error updating consultation type:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update consultation type",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/consultation-types/:id
 * 相談種別を削除（論理削除）
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

    // 論理削除
    const { error } = await supabaseAdmin
      .from("consultation_types")
      .update({ is_active: false })
      .eq("id", params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: "Consultation type deleted successfully" })
  } catch (error) {
    console.error("Error deleting consultation type:", error)
    return NextResponse.json(
      {
        error: "Failed to delete consultation type",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
