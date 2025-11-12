"use client"

import { useRouter } from "next/navigation"
import { useState, FormEvent } from "react"
import { Button } from "@/src/components/ui/Button"

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // 簡易パスワード認証（環境変数から取得、デフォルトは "admin123"）
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123"

    if (password === correctPassword) {
      // セッションストレージに認証トークンを保存
      sessionStorage.setItem("admin_authenticated", "true")
      router.push("/admin")
    } else {
      setError("パスワードが正しくありません")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-panel to-panel flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-text mb-2">
              管理者ログイン
            </h1>
            <p className="text-sm text-muted">
              管理画面にアクセスするにはパスワードを入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-text mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all"
                placeholder="パスワードを入力"
                autoFocus
                required
              />
            </div>

            {error && (
              <div className="bg-error/10 border border-error rounded-lg p-3">
                <p className="text-sm text-error font-medium">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
            >
              {loading ? "確認中..." : "ログイン"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted text-center">
              パスワードを忘れた場合は、システム管理者にお問い合わせください
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
