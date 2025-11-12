/**
 * リマインダーメール送信 Cron Job API
 * Vercel CronまたはGitHub Actionsから定期的に呼び出される
 *
 * 使い方:
 * - 24時間前リマインダー: POST /api/cron/reminders?type=24h
 * - 30分前リマインダー: POST /api/cron/reminders?type=30m
 *
 * Cron設定（vercel.json）:
 * - 24時間前: 毎時0分 (0 * * * *)
 * - 30分前: 5分ごと (every 5 minutes)
 */

import { NextRequest, NextResponse } from "next/server"
import { processReminders, ReminderType } from "@/lib/reminders/reminder-service"

/**
 * Cron Job認証
 * Vercel Cronの場合は、環境変数CRON_SECRETで保護
 */
function isAuthorizedCronRequest(request: NextRequest): boolean {
  // Vercel Cronからのリクエストかチェック
  const authHeader = request.headers.get("authorization")

  if (!authHeader) {
    return false
  }

  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn("⚠️ CRON_SECRET not set - cron jobs are unprotected")
    return true // 開発環境では認証をスキップ
  }

  return authHeader === `Bearer ${cronSecret}`
}

/**
 * POST /api/cron/reminders?type=24h または ?type=30m
 */
export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    if (!isAuthorizedCronRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // パラメータからリマインダータイプを取得
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type") as ReminderType | null

    if (!type || (type !== "24h" && type !== "30m")) {
      return NextResponse.json(
        { error: "Invalid reminder type. Use ?type=24h or ?type=30m" },
        { status: 400 }
      )
    }

    console.log(`🔔 Cron job triggered: ${type} reminders`)

    // リマインダー送信処理を実行
    const result = await processReminders(type)

    return NextResponse.json({
      success: true,
      reminderType: type,
      summary: {
        total: result.total,
        sent: result.sent,
        failed: result.failed,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
    })
  } catch (error) {
    console.error("Cron job error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/reminders?type=24h または ?type=30m
 * テスト用エンドポイント（手動実行）
 */
export async function GET(request: NextRequest) {
  // 認証チェック
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type") as ReminderType | null

  if (!type || (type !== "24h" && type !== "30m")) {
    return NextResponse.json(
      {
        message: "Reminder cron job endpoint",
        usage: "POST /api/cron/reminders?type=24h or ?type=30m",
        note: "Requires Authorization: Bearer {CRON_SECRET} header",
      },
      { status: 400 }
    )
  }

  console.log(`🧪 Manual trigger: ${type} reminders`)

  // リマインダー送信処理を実行
  const result = await processReminders(type)

  return NextResponse.json({
    success: true,
    reminderType: type,
    summary: {
      total: result.total,
      sent: result.sent,
      failed: result.failed,
    },
    errors: result.errors.length > 0 ? result.errors : undefined,
  })
}
