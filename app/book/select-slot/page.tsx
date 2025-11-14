"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ja } from "date-fns/locale"
import { formatDate } from "@/lib/utils"
import { ConsultationMode, RecentModeOverride } from "@/types"
import type { ConsultationType } from "@/types"

// スタッフデータの型
interface Staff {
  id: string
  name: string
  color: string
}

// 空き枠データの型
interface AvailableSlot {
  time: Date
  availableStaff: Staff[]
}

export default function SelectSlotPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationTypeId = searchParams.get("type")
  const dateParam = searchParams.get("date")

  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 相談種別データと日付取得
  useEffect(() => {
    if (!consultationTypeId || !dateParam) {
      router.push("/book")
      return
    }

    // 日付を設定
    setSelectedDate(new Date(dateParam))

    // TODO: APIから取得
    // 仮データ
    setConsultationType({
      id: consultationTypeId,
      name: "初回相談（AI導入）",
      duration_minutes: 30,
      buffer_before_minutes: 5,
      buffer_after_minutes: 5,
      mode: ConsultationMode.IMMEDIATE,
      recent_mode_override: RecentModeOverride.KEEP,
      display_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }, [consultationTypeId, dateParam, router])

  // 空き枠を取得（リトライ機能付き）
  useEffect(() => {
    if (!selectedDate || !consultationType) {
      setAvailableSlots([])
      setIsLoading(false)
      return
    }

    // Supabase APIから実際の空き枠を取得
    const fetchAvailableSlots = async (attempt = 0): Promise<void> => {
      setIsLoading(true)
      setError(null)

      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd")
        const response = await fetch(
          `/api/slots/simple?date=${dateStr}&type=${consultationType.id}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        interface SlotResponse {
          time: string
          availableStaff: Array<{ id: string; name: string }>
        }

        const slots: AvailableSlot[] = data.slots.map((slot: SlotResponse) => ({
          time: new Date(slot.time),
          availableStaff: slot.availableStaff.map((staff) => ({
            id: staff.id,
            name: staff.name,
            color: staff.id.includes("a") ? "#6EC5FF" : "#FFC870", // 担当者Aは青、担当者Bはオレンジ
          })),
        }))

        setAvailableSlots(slots)
        setError(null)
      } catch (err) {
        console.error("Error fetching slots:", err)

        // 最大3回までリトライ
        if (attempt < 2) {
          console.log(`Retrying... (attempt ${attempt + 2}/3)`)
          setTimeout(() => {
            fetchAvailableSlots(attempt + 1)
          }, 1000 * (attempt + 1)) // 1秒、2秒と徐々に遅延
          return
        }

        setError("空き枠の取得に失敗しました。ネットワーク接続を確認して、再度お試しください。")
        setAvailableSlots([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAvailableSlots()
  }, [selectedDate, consultationType, retryCount])

  const handleSlotSelect = (slot: AvailableSlot, staff: Staff) => {
    if (!consultationType) return

    const endTime = new Date(slot.time)
    endTime.setMinutes(endTime.getMinutes() + consultationType.duration_minutes)

    // スロット情報をセッションストレージに保存
    const slotData = {
      start_time: slot.time.toISOString(),
      end_time: endTime.toISOString(),
      staff_id: staff.id,
      staff_name: staff.name,
      consultation_type_id: consultationType.id,
    }
    sessionStorage.setItem("selected_slot", JSON.stringify(slotData))

    // フォームページに遷移
    router.push("/book/form")
  }

  const handleBack = () => {
    // 日付選択ページに戻る（相談種別IDを保持）
    router.push(`/book/select-date?type=${consultationTypeId}`)
  }

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
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
            時間を選択してください
          </h1>
          <p className="text-gray-600">
            {selectedDate && format(selectedDate, "M月d日(E)", { locale: ja })} | {consultationType.name}（{consultationType.duration_minutes}分）
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">エラーが発生しました</h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  再試行する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 時間選択 */}
        {isLoading ? (
          // ローディングスケルトン
          <div className="space-y-3 mb-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-full py-5 px-6 bg-gray-100 border-2 border-gray-200 rounded-lg animate-pulse"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-8 bg-gray-300 rounded" />
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-300" />
                      <div className="w-16 h-4 bg-gray-300 rounded" />
                    </div>
                  </div>
                  <div className="w-12 h-4 bg-gray-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? null : selectedDate && availableSlots.length > 0 ? (
          <div className="space-y-3 mb-8">
            {availableSlots.map((slot) => {
              const hasAvailability = slot.availableStaff.length > 0

              return (
                <button
                  key={slot.time.toISOString()}
                  onClick={() => hasAvailability && handleSlotSelect(slot, slot.availableStaff[0])}
                  disabled={!hasAvailability}
                  className={`w-full py-5 px-6 rounded-lg text-left transition-all ${
                    hasAvailability
                      ? 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-500'
                      : 'bg-gray-100 border-2 border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {/* 時間 */}
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold ${
                        hasAvailability ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {formatDate(slot.time, "HH:mm")}
                      </div>
                      {hasAvailability && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-green-600">
                            予約可能
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 状態表示 */}
                    <div className="flex items-center gap-2">
                      {hasAvailability ? (
                        <>
                          <span className="text-sm text-gray-500">
                            {slot.availableStaff.length}枠
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
                        </>
                      ) : (
                        <span className="text-sm font-medium text-gray-500">
                          満席
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          // 空き枠がない場合
          <div className="mb-8 text-center py-12">
            <p className="text-gray-500">この日は予約可能な時間がありません</p>
          </div>
        )}

        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="w-full py-4 px-6 bg-white hover:bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-700 font-medium transition-all"
        >
          ← 日付選択に戻る
        </button>
      </div>
    </div>
  )
}
