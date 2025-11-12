import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { inquirySourceDb } from "@/lib/supabase/database"
import { z } from "zod"

const createInquirySourceSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  display_order: z.number().int().min(0).default(0),
})

/**
 * GET /api/admin/inquiry-sources
 * 全お問い合わせ元を取得（管理者用）
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: inquirySources, error } = await supabaseAdmin
      .from("inquiry_sources")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ inquirySources })
  } catch (error) {
    console.error("Error fetching inquiry sources:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch inquiry sources",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/inquiry-sources
 * お問い合わせ元を作成
 */
export async function POST(request: NextRequest) {
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
    const validated = createInquirySourceSchema.parse(body)

    // お問い合わせ元を作成
    const { data: newSource, error } = await supabaseAdmin
      .from("inquiry_sources")
      .insert({
        ...validated,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ inquirySource: newSource }, { status: 201 })
  } catch (error) {
    console.error("Error creating inquiry source:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create inquiry source",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
