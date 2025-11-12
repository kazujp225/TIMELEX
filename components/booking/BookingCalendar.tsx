"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { ConsultationType } from "@/types"

interface BookingCalendarProps {
  consultationTypes: ConsultationType[]
}

export function BookingCalendar({
  consultationTypes,
}: BookingCalendarProps) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleTypeSelect = (typeId: string) => {
    // 日付選択ページに遷移
    router.push(`/book/select-date?type=${typeId}`)
  }

  const toggleAccordion = (typeId: string) => {
    setExpandedId(expandedId === typeId ? null : typeId)
  }

  return (
    <div className="h-screen flex flex-col bg-panel overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-panel border-b-2 border-border">
        <div className="w-full px-4 py-4">
          <div className="w-full sm:max-w-4xl mx-auto text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-brand-600 mb-2">TIMREXPLUS</h1>
            <h2 className="text-lg sm:text-xl font-bold text-text mb-1">
              オンライン面談のご予約
            </h2>
            <p className="text-sm text-muted">
              希望の相談種別を選択してください
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="w-full sm:max-w-4xl mx-auto">
          {/* 相談種別選択（アコーディオン） */}
          <div>
            <label className="block text-base font-medium text-text mb-3">
              相談種別 <span className="text-danger">*</span>
            </label>
            <div className="space-y-3">
              {consultationTypes.map((type) => (
                <div
                  key={type.id}
                  className="border-2 border-border rounded-md overflow-hidden transition-all"
                >
                  {/* アコーディオンヘッダー */}
                  <button
                    onClick={() => toggleAccordion(type.id)}
                    className="w-full py-3 px-4 flex items-center justify-between bg-panel hover:bg-panel-muted transition-all"
                  >
                    <span className="text-base font-medium text-text text-left">
                      {type.name}
                    </span>
                    <svg
                      className={`w-5 h-5 text-muted transition-transform ${
                        expandedId === type.id ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* アコーディオンコンテンツ */}
                  {expandedId === type.id && (
                    <div className="px-4 py-3 bg-panel-muted border-t-2 border-border animate-in slide-in-from-top-2 duration-300">
                      <p className="text-sm text-muted mb-3">
                        所要時間: {type.duration_minutes}分
                      </p>
                      <button
                        onClick={() => handleTypeSelect(type.id)}
                        className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-600/90 text-white rounded-md text-base font-medium transition-all"
                      >
                        この相談種別で予約する
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
