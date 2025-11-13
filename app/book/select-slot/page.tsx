"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { formatDate, getWeekday } from "@/lib/utils"
import type { ConsultationType } from "@/types"

// モックスタッフデータ
interface Staff {
  id: string
  name: string
  color: string
}

const MOCK_STAFF: Staff[] = [
  { id: "staff-1", name: "スタッフA", color: "#6EC5FF" },
  { id: "staff-2", name: "スタッフB", color: "#FFC870" },
]

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
      mode: "immediate" as any,
      recent_mode_override: "keep" as any,
      display_order: 1,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    })
  }, [consultationTypeId, dateParam, router])

  // 空き枠を取得
  useEffect(() => {
    if (!selectedDate || !consultationType) {
      setAvailableSlots([])
      return
    }

    // Supabase APIから実際の空き枠を取得
    const fetchAvailableSlots = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const response = await fetch(
        `/api/slots/simple?date=${dateStr}&consultation_type_id=${consultationType.id}`
      )

      if (!response.ok) {
        console.error("Failed to fetch slots")
        setAvailableSlots([])
        return
      }

      const data = await response.json()

      const slots: AvailableSlot[] = data.slots.map((slot: any) => ({
        time: new Date(slot.time),
        availableStaff: slot.availableStaff.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          color: staff.id.includes("a") ? "#6EC5FF" : "#FFC870", // 担当者Aは青、担当者Bはオレンジ
        })),
      }))

      setAvailableSlots(slots)
    }

    fetchAvailableSlots()
  }, [selectedDate, consultationType])

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

  if (!consultationType) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-panel overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-panel border-b-2 border-border">
        <div className="w-full px-4 py-5">
          <div className="w-full sm:max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-600 mb-3">TIMREXPLUS</h1>
            <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">
              時間を選択してください
            </h2>
            <p className="text-base text-muted">
              {selectedDate && format(selectedDate, "M月d日(E)", { locale: ja })} | {consultationType.name}（{consultationType.duration_minutes}分）
            </p>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="w-full sm:max-w-4xl mx-auto">

            {/* 時間選択 */}
            {selectedDate && availableSlots.length > 0 && (
              <div>
                <p className="text-base text-muted mb-4">
                  予約可能な時間帯をタップしてください
                </p>

                {/* 時間帯リスト */}
                <div className="space-y-3">
                  {availableSlots.map((slot) => {
                    const hasAvailability = slot.availableStaff.length > 0

                    return (
                      <div
                        key={slot.time.toISOString()}
                        className={`border-2 rounded-lg overflow-hidden transition-all ${
                          hasAvailability
                            ? 'border-brand-400 hover:border-brand-500 hover:shadow-md'
                            : 'border-border bg-panel-muted opacity-60'
                        }`}
                      >
                        <button
                          onClick={() => hasAvailability && handleSlotSelect(slot, slot.availableStaff[0])}
                          disabled={!hasAvailability}
                          className={`w-full py-4 px-5 text-left transition-all ${
                            hasAvailability
                              ? 'hover:bg-brand-50 active:scale-98'
                              : 'cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            {/* 時間 */}
                            <div className="flex items-center gap-3">
                              <div className={`text-2xl font-bold ${
                                hasAvailability ? 'text-brand-600' : 'text-muted'
                              }`}>
                                {formatDate(slot.time, "HH:mm")}
                              </div>
                              {hasAvailability && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                  <span className="text-sm font-medium text-success">
                                    予約可能
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* 状態表示 */}
                            <div className="flex items-center gap-2">
                              {hasAvailability ? (
                                <>
                                  <span className="text-sm text-muted">
                                    {slot.availableStaff.length}枠
                                  </span>
                                  <div className="text-brand-600 text-xl">→</div>
                                </>
                              ) : (
                                <span className="text-sm font-medium text-muted">
                                  × 満席
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* フッター（戻るボタン） */}
      <div className="border-t-2 border-border bg-panel px-4 py-4">
        <div className="w-full sm:max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="w-full py-4 px-5 rounded-lg border-2 border-border text-text hover:bg-panel-muted transition-all text-lg font-medium active:scale-98"
          >
            ← 日付選択に戻る
          </button>
        </div>
      </div>
    </div>
  )
}
