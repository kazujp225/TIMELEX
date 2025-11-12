"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function Product1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // UTMパラメータを保持したまま直接日付選択ページへ
    const params = new URLSearchParams(searchParams.toString())
    params.set("type", "1")

    // トラッキングデータをセッションストレージに保存
    if (typeof window !== "undefined") {
      const tracking = {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
        referrer: document.referrer || null,
        landing_page: window.location.href,
      }
      sessionStorage.setItem("booking_tracking", JSON.stringify(tracking))
    }

    router.replace(`/book/select-date?${params.toString()}`)
  }, [router, searchParams])

  return (
    <div className="h-screen flex items-center justify-center bg-panel">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">商材1の予約ページに移動中...</p>
      </div>
    </div>
  )
}
