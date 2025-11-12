"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
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

  const handleDateSelect = (date: Date) => {
    // 日付情報をセッションストレージに保存
    sessionStorage.setItem("selected_date", date.toISOString())
    // スタッフ選択ページに遷移
    router.push(`/book/select-slot?type=${consultationTypeId}&date=${date.toISOString()}`)
  }

  const handleBack = () => {
    router.push("/book")
  }

  if (!consultationType) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-panel overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-panel border-b-2 border-border">
        <div className="w-full px-4 py-4">
          <div className="w-full sm:max-w-4xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-600 mb-2">TIMREXPLUS</h1>
            <h2 className="text-lg sm:text-xl font-bold text-text mb-1">
              日付を選択してください
            </h2>
            <p className="text-sm text-muted">
              {consultationType.name}（{consultationType.duration_minutes}分）
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="w-full sm:max-w-4xl mx-auto">
          {/* 日付選択 */}
          <div className="mb-4">
            <label className="block text-base font-medium text-text mb-3">
              日付を選択 <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {dates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className="w-full py-3 px-4 rounded-md border-2 text-left transition-all border-border hover:border-brand-600/50 hover:bg-brand-600/10"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">
                      {format(date, "M月d日", { locale: ja })}（{getWeekday(date)}）
                    </span>
                    <svg
                      className="w-5 h-5 text-muted"
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
      </div>

      {/* フッター（戻るボタン） */}
      <div className="border-t-2 border-border bg-panel px-4 py-3">
        <div className="w-full sm:max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="w-full py-3 px-4 rounded-md border-2 border-border text-text hover:bg-panel-muted transition-all text-base"
          >
            ← 相談種別選択に戻る
          </button>
        </div>
      </div>
    </div>
  )
}
