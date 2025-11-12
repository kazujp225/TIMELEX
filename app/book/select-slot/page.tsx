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

    // TODO: APIから空き枠を取得
    // モック：ランダムに空き枠を生成
    const timeSlots = [
      { hour: 9, minute: 0 },
      { hour: 9, minute: 30 },
      { hour: 10, minute: 0 },
      { hour: 10, minute: 30 },
      { hour: 11, minute: 0 },
      { hour: 11, minute: 30 },
      { hour: 13, minute: 0 },
      { hour: 13, minute: 30 },
      { hour: 14, minute: 0 },
      { hour: 14, minute: 30 },
      { hour: 15, minute: 0 },
      { hour: 15, minute: 30 },
      { hour: 16, minute: 0 },
      { hour: 16, minute: 30 },
      { hour: 17, minute: 0 },
    ]

    const mockAvailableSlots: AvailableSlot[] = timeSlots.map(({ hour, minute }) => {
      const slotTime = new Date(selectedDate)
      slotTime.setHours(hour, minute, 0, 0)

      // ランダムに空き状況を生成
      const availableStaff: Staff[] = []
      MOCK_STAFF.forEach((staff) => {
        // 70%の確率で空いている
        if (Math.random() > 0.3) {
          availableStaff.push(staff)
        }
      })

      return {
        time: slotTime,
        availableStaff,
      }
    })

    setAvailableSlots(mockAvailableSlots)
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
    router.push(`/book/select-date?type=${consultationTypeId}`)
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
              時間を選択してください
            </h2>
            <p className="text-sm text-muted">
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
                <p className="text-sm text-muted mb-3">
                  空いているスタッフをクリックすると予約情報入力へ進みます
                </p>

                {/* スタッフ凡例 */}
                <div className="flex items-center gap-4 mb-3">
                  {MOCK_STAFF.map((staff) => (
                    <div key={staff.id} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: staff.color }}
                      />
                      <span className="text-sm font-medium text-text">{staff.name}</span>
                    </div>
                  ))}
                </div>

                {/* 時間帯別空き状況表 */}
                <div className="border-2 border-border rounded-md overflow-hidden">
                  <div className="bg-panel-muted py-2 px-4 border-b-2 border-border">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-text">時間</div>
                      <div className="text-sm font-medium text-text text-center">スタッフA</div>
                      <div className="text-sm font-medium text-text text-center">スタッフB</div>
                    </div>
                  </div>
                  <div>
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.time.toISOString()}
                        className="py-2 px-4 border-b border-border last:border-b-0 hover:bg-panel-muted transition-colors"
                      >
                        <div className="grid grid-cols-3 gap-2 items-center">
                          {/* 時間 */}
                          <div className="text-sm font-medium text-text">
                            {formatDate(slot.time, "HH:mm")}
                          </div>

                          {/* スタッフ */}
                          {MOCK_STAFF.map((staff) => {
                            const isAvailable = slot.availableStaff.some(s => s.id === staff.id)
                            return (
                              <div key={staff.id} className="text-center">
                                {isAvailable ? (
                                  <button
                                    onClick={() => handleSlotSelect(slot, staff)}
                                    className="w-full py-2 px-3 rounded text-sm font-medium text-white transition-all hover:opacity-90"
                                    style={{ backgroundColor: staff.color }}
                                  >
                                    ◯
                                  </button>
                                ) : (
                                  <div className="w-full py-2 px-3 rounded text-sm font-medium text-muted bg-panel-muted">
                                    ×
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* フッター（戻るボタン） */}
      <div className="border-t-2 border-border bg-panel px-4 py-3">
        <div className="w-full sm:max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="w-full py-3 px-4 rounded-md border-2 border-border text-text hover:bg-panel-muted transition-all text-base"
          >
            ← 日付選択に戻る
          </button>
        </div>
      </div>
    </div>
  )
}
