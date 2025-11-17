"use client"

import { useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"

interface TrackingData {
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  referrer: string | null
  landing_page: string | null
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationTypeId = params.id as string

  useEffect(() => {
    // UTM/リファラ追跡データ取得
    const tracking: TrackingData = {
      utm_source: searchParams.get("utm_source"),
      utm_medium: searchParams.get("utm_medium"),
      utm_campaign: searchParams.get("utm_campaign"),
      utm_term: searchParams.get("utm_term"),
      utm_content: searchParams.get("utm_content"),
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      landing_page: typeof window !== "undefined" ? window.location.href : null,
    }

    // トラッキングデータをセッションストレージに保存
    if (typeof window !== "undefined") {
      sessionStorage.setItem("booking_tracking", JSON.stringify(tracking))
    }

    // デバッグログ（開発時のみ）
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Tracking data captured:", tracking)
    }

    // 相談種別IDがない場合はエラーページへ
    if (!consultationTypeId) {
      router.push("/404")
      return
    }

    // 日付選択ページへリダイレクト
    router.push(`/book/select-date?type=${consultationTypeId}`)
  }, [consultationTypeId, router, searchParams])

  return (
    <div className="h-screen flex items-center justify-center bg-panel">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-muted">読み込み中...</p>
      </div>
    </div>
  )
}
