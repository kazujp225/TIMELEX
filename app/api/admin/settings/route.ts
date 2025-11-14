import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { supabaseAdmin } from "@/lib/supabase/client"
import { settingsDb } from "@/lib/supabase/database"
import { z } from "zod"

const updateSettingsSchema = z.object({
  minimum_booking_hours: z.number().int().min(0).max(48).optional(),
  maximum_booking_days: z.number().int().min(7).max(365).optional(),
  recent_customer_days: z.number().int().min(7).max(90).optional(),
  cancellation_deadline_hours: z.number().int().min(0).max(48).optional(),
  data_retention_days: z.number().int().min(30).max(365).optional(),
})

/**
 * GET /api/admin/settings
 * 全設定を取得
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.staffId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const settings = await settingsDb.getAll()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/settings
 * 設定を更新
 */
export async function PATCH(request: NextRequest) {
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
    const validated = updateSettingsSchema.parse(body)

    // 各設定を更新
    for (const [key, value] of Object.entries(validated)) {
      if (value !== undefined) {
        const { error } = await supabaseAdmin
          .from("global_settings")
          .update({ value })
          .eq("key", key)

        if (error) {
          throw error
        }
      }
    }

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Failed to update settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
