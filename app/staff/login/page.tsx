"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function StaffLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 一旦ログインページをスキップして直接スタッフダッシュボードへ
    router.push("/staff")
  }, [router])

  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  )
}
