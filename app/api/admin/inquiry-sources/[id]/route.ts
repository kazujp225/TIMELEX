import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { inquirySourceDb } from "@/lib/supabase/database"
import { z } from "zod"

const updateInquirySourceSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  display_order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

/**
 * PATCH /api/admin/inquiry-sources/:id
 * お問い合わせ元を更新
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
    const validated = updateInquirySourceSchema.parse(body)

    // お問い合わせ元を更新
    const { data: updatedSource, error } = await supabaseAdmin
      .from("inquiry_sources")
      .update(validated)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!updatedSource) {
      return NextResponse.json(
        { error: "Inquiry source not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ inquirySource: updatedSource })
  } catch (error) {
    console.error("Error updating inquiry source:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update inquiry source",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
