"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function GoogleAuthPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [refreshToken, setRefreshToken] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      setStatus("error")
      setMessage(`認証エラー: ${error}`)
      return
    }

    if (code) {
      handleAuthCode(code)
    }
  }, [searchParams])

  const handleAuthCode = async (code: string) => {
    try {
      setStatus("loading")
      setMessage("トークンを取得中...")

      const response = await fetch("/api/admin/google-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setRefreshToken(data.refresh_token)
        setMessage("認証に成功しました！")
      } else {
        setStatus("error")
        setMessage(data.error || "トークン取得に失敗しました")
      }
    } catch (error) {
      setStatus("error")
      setMessage("エラーが発生しました")
    }
  }

  const handleStartAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/admin/google-auth`
    const scope = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ].join(" ")

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`

    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Google Calendar 認証</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "idle" && (
            <div className="space-y-4">
              <p className="text-base">
                contact@zettai.co.jp のGoogleアカウントで認証してください。
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ 注意</strong><br />
                  この操作は初回のみ必要です。取得したリフレッシュトークンを<code className="bg-yellow-100 px-1 py-0.5 rounded">.env.local</code>に保存してください。
                </p>
              </div>
              <Button
                onClick={handleStartAuth}
                className="h-14 px-8 text-base font-semibold"
              >
                Google認証を開始
              </Button>
            </div>
          )}

          {status === "loading" && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full" />
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-base font-semibold text-green-900">✅ {message}</p>
              </div>

              <div className="space-y-2">
                <p className="text-base font-semibold">リフレッシュトークン:</p>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <code className="text-sm break-all">{refreshToken}</code>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-900">次の手順:</p>
                <ol className="text-sm text-blue-900 space-y-2 ml-4 list-decimal">
                  <li>上記のリフレッシュトークンをコピー</li>
                  <li><code className="bg-blue-100 px-1 py-0.5 rounded">.env.local</code> ファイルを開く</li>
                  <li>以下の行を追加:
                    <pre className="bg-blue-100 p-2 rounded mt-2 text-xs">
GOOGLE_REFRESH_TOKEN=ここにコピーしたトークンを貼り付け
                    </pre>
                  </li>
                  <li>開発サーバーを再起動</li>
                </ol>
              </div>

              <Button
                onClick={() => window.location.href = "/admin/settings"}
                variant="outline"
                className="h-14 px-8 text-base font-semibold"
              >
                設定画面に戻る
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-base font-semibold text-red-900">❌ {message}</p>
              </div>
              <Button
                onClick={handleStartAuth}
                variant="outline"
                className="h-14 px-8 text-base font-semibold"
              >
                再試行
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
