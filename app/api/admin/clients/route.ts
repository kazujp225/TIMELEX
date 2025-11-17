import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { z } from "zod"

const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  email: z.string().email().optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional(),
})

/**
 * GET /api/admin/clients
 * クライアント一覧を取得
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

    const { data: clients, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ clients })
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch clients",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/clients
 * クライアントを作成
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
    const validated = createClientSchema.parse(body)

    // スラッグの重複チェック
    const { data: existing } = await supabaseAdmin
      .from("clients")
      .select("id")
      .eq("slug", validated.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: "このスラッグは既に使用されています" },
        { status: 409 }
      )
    }

    // クライアントを作成
    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .insert({
        name: validated.name,
        slug: validated.slug,
        email: validated.email || null,
        company: validated.company || null,
        description: validated.description || null,
        is_active: validated.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create client",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
