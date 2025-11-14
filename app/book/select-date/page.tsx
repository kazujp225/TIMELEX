"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays, startOfDay } from "date-fns"
import { ja } from "date-fns/locale"
import { getWeekday } from "@/lib/utils"
import type { ConsultationType } from "@/types"

export default function SelectDatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationTypeId = searchParams.get("type")

  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null)

  // 相談種別データ取得
  useEffect(() => {
    if (!consultationTypeId) {
      router.push("/book")
      return
    }

    // TODO: APIから取得
    // 仮データ
    setConsultationType({
      id: consultationTypeId,
      name: "初回相談（AI導入）",
      duration_minutes: 30,
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
      mode: "immediate" as any,
      recent_mode_override: "keep" as any,
      display_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }, [consultationTypeId, router])

  // 今日から7日分の日付を生成
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))

  const handleDateSelect = async (date: Date) => {
    // 日付情報をセッションストレージに保存
    sessionStorage.setItem("selected_date", date.toISOString())

    // データをプリフェッチして次ページでのローディング時間を短縮
    if (consultationType) {
      const dateStr = format(date, "yyyy-MM-dd")
      // バックグラウンドでデータをフェッチ（結果は待たずに遷移）
      fetch(`/api/slots/simple?date=${dateStr}&consultation_type_id=${consultationType.id}`)
        .catch((err) => console.error("Prefetch failed:", err))
    }

    // スタッフ選択ページに遷移
    router.push(`/book/select-slot?type=${consultationTypeId}&date=${date.toISOString()}`)
  }

  if (!consultationType) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            日付を選択してください
          </h1>
          <p className="text-gray-600">
            {consultationType.name}（{consultationType.duration_minutes}分）
          </p>
        </div>

        {/* 日付選択 */}
        <div className="space-y-3">
          {dates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className="w-full py-5 px-6 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500 rounded-lg text-left transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  {format(date, "M月d日", { locale: ja })}（{getWeekday(date)}）
                </span>
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
