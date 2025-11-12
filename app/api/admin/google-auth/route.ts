import { NextRequest, NextResponse } from "next/server"

/**
 * POST /api/admin/google-auth
 * Google OAuth認証コードからリフレッシュトークンを取得
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      )
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/google-auth`

    // Google OAuth2トークンエンドポイントにリクエスト
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData)
      return NextResponse.json(
        { error: tokenData.error_description || "Failed to get tokens" },
        { status: 400 }
      )
    }

    // リフレッシュトークンを返す
    return NextResponse.json({
      refresh_token: tokenData.refresh_token,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
    })
  } catch (error) {
    console.error("Error in google-auth:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
