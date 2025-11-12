import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

/**
 * CSRF保護ミドルウェア
 *
 * 使用方法:
 * 1. フォームレンダリング時にCSRFトークンを生成
 * 2. フォーム送信時にトークンを検証
 */

const CSRF_TOKEN_HEADER = "x-csrf-token"
const CSRF_TOKEN_COOKIE = "csrf-token"
const CSRF_SECRET_LENGTH = 32

/**
 * CSRFトークンを生成
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_SECRET_LENGTH).toString("hex")
}

/**
 * CSRFトークンを検証
 */
export function verifyCsrfToken(
  request: NextRequest,
  expectedToken: string
): boolean {
  // リクエストヘッダーからトークンを取得
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER)

  // Cookie からトークンを取得（フォールバック）
  const cookieToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value

  const providedToken = headerToken || cookieToken

  if (!providedToken || !expectedToken) {
    return false
  }

  // タイミング攻撃を防ぐため、crypto.timingSafeEqualを使用
  try {
    const providedBuffer = Buffer.from(providedToken, "hex")
    const expectedBuffer = Buffer.from(expectedToken, "hex")

    if (providedBuffer.length !== expectedBuffer.length) {
      return false
    }

    return crypto.timingSafeEqual(providedBuffer, expectedBuffer)
  } catch {
    return false
  }
}

/**
 * CSRF保護ミドルウェア
 * POST、PUT、PATCH、DELETEリクエストでCSRFトークンを検証
 */
export function csrfProtection(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    // GETとHEADリクエストはCSRF検証をスキップ
    if (request.method === "GET" || request.method === "HEAD") {
      return handler(request, ...args)
    }

    // 公開エンドポイント（予約作成等）はスキップ
    // TODO: パスに基づいて除外ロジックを追加
    const pathname = request.nextUrl.pathname
    if (pathname.startsWith("/api/bookings") && request.method === "POST") {
      return handler(request, ...args)
    }
    if (pathname.startsWith("/api/slots")) {
      return handler(request, ...args)
    }

    // セッションからCSRFトークンを取得（本実装では要セッション管理）
    // 簡易実装: Cookieから取得
    const expectedToken = request.cookies.get(CSRF_TOKEN_COOKIE)?.value

    if (!expectedToken) {
      return NextResponse.json(
        { error: "CSRF token missing" },
        { status: 403 }
      )
    }

    if (!verifyCsrfToken(request, expectedToken)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      )
    }

    return handler(request, ...args)
  }
}

/**
 * レスポンスにCSRFトークンをセット
 */
export function setCsrfToken(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3600, // 1時間
  })

  return response
}
