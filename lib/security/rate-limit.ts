import { NextRequest, NextResponse } from "next/server"

/**
 * レート制限ミドルウェア
 * IPアドレスベースでAPIリクエスト数を制限
 */

interface RateLimitConfig {
  interval: number // 時間窓（ミリ秒）
  maxRequests: number // 最大リクエスト数
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// メモリベースのストア（本番環境ではRedis等を使用推奨）
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * デフォルト設定
 */
const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000, // 1分
  maxRequests: 60, // 60リクエスト/分
}

/**
 * エンドポイント別の設定
 */
const ENDPOINT_CONFIGS: Record<string, RateLimitConfig> = {
  "/api/bookings": {
    interval: 60 * 1000, // 1分
    maxRequests: 10, // 予約作成は10リクエスト/分まで
  },
  "/api/slots": {
    interval: 60 * 1000,
    maxRequests: 30, // 空き枠取得は30リクエスト/分まで
  },
  "/api/admin": {
    interval: 60 * 1000,
    maxRequests: 100, // 管理者APIは100リクエスト/分まで
  },
}

/**
 * IPアドレスを取得
 */
function getClientIp(request: NextRequest): string {
  // X-Forwarded-For ヘッダーから取得（プロキシ背後の場合）
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  // X-Real-IP ヘッダーから取得
  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // デフォルト
  return "unknown"
}

/**
 * エンドポイントの設定を取得
 */
function getConfig(pathname: string): RateLimitConfig {
  // 完全一致
  if (ENDPOINT_CONFIGS[pathname]) {
    return ENDPOINT_CONFIGS[pathname]
  }

  // プレフィックス一致
  for (const [path, config] of Object.entries(ENDPOINT_CONFIGS)) {
    if (pathname.startsWith(path)) {
      return config
    }
  }

  return DEFAULT_CONFIG
}

/**
 * レート制限をチェック
 */
export function checkRateLimit(
  request: NextRequest,
  config?: RateLimitConfig
): { allowed: boolean; limit: number; remaining: number; resetTime: number } {
  const ip = getClientIp(request)
  const pathname = request.nextUrl.pathname
  const finalConfig = config || getConfig(pathname)

  const key = `${ip}:${pathname}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // エントリが存在しない、または期限切れの場合は新規作成
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + finalConfig.interval,
    }
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      limit: finalConfig.maxRequests,
      remaining: finalConfig.maxRequests - 1,
      resetTime: entry.resetTime,
    }
  }

  // カウントを増加
  entry.count++

  // 制限を超えているかチェック
  const allowed = entry.count <= finalConfig.maxRequests

  return {
    allowed,
    limit: finalConfig.maxRequests,
    remaining: Math.max(0, finalConfig.maxRequests - entry.count),
    resetTime: entry.resetTime,
  }
}

/**
 * レート制限ミドルウェア
 */
export function rateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  config?: RateLimitConfig
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const result = checkRateLimit(request, config)

    // レスポンスヘッダーにレート制限情報を追加
    const headers = new Headers()
    headers.set("X-RateLimit-Limit", result.limit.toString())
    headers.set("X-RateLimit-Remaining", result.remaining.toString())
    headers.set(
      "X-RateLimit-Reset",
      new Date(result.resetTime).toISOString()
    )

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000)
      headers.set("Retry-After", retryAfter.toString())

      return NextResponse.json(
        {
          error: "Too many requests",
          message: "レート制限を超えています。しばらくしてから再試行してください。",
          retryAfter,
        },
        {
          status: 429,
          headers,
        }
      )
    }

    // ハンドラーを実行
    const response = await handler(request, ...args)

    // レート制限ヘッダーを追加
    headers.forEach((value, key) => {
      response.headers.set(key, value)
    })

    return response
  }
}

/**
 * 定期的にストアをクリーンアップ（メモリリーク防止）
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// 5分ごとにクリーンアップ
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
