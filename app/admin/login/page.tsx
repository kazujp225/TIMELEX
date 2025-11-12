"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 一旦ログインページをスキップして直接管理者ダッシュボードへ
    router.push("/admin")
  }, [router])

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-gradient-to-br from-purple-500/5 via-background to-purple-500/5">
      <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
    </div>
  )
}
