import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { z } from "zod"

const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  duration: z.number().min(15).max(480).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  is_active: z.boolean().optional(),
})

/**
 * GET /api/admin/products
 * 商材一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/products
 * 商材を作成
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // バリデーション
    const validated = createProductSchema.parse(body)

    // 商材を作成
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert({
        name: validated.name,
        description: validated.description || null,
        duration: validated.duration || 30,
        color: validated.color || '#6EC5FF',
        is_active: validated.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create product",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
