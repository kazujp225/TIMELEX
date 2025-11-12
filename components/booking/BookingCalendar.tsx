"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ConsultationType } from "@/types"
import { formatDate, getWeekday } from "@/lib/utils"

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

interface BookingCalendarProps {
  consultationTypes: ConsultationType[]
  onSlotSelect: (slot: {
    start_time: Date
    end_time: Date
    staff_id: string
    staff_name: string
  }) => void
}

export function BookingCalendar({
  consultationTypes,
  onSlotSelect,
}: BookingCalendarProps) {
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ time: Date; staff: Staff } | null>(null)
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])

  // 今日から7日分の日付を生成
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))

  // 日付と相談種別が選択された時に空き枠を取得
  useEffect(() => {
    if (!selectedDate || !selectedType) {
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
  }, [selectedDate, selectedType])

  const handleSlotSelect = (slot: AvailableSlot, staff: Staff) => {
    setSelectedSlot({ time: slot.time, staff })
  }

  const handleNext = () => {
    if (selectedSlot && selectedType) {
      const type = consultationTypes.find((t) => t.id === selectedType)
      if (!type) return

      const endTime = new Date(selectedSlot.time)
      endTime.setMinutes(endTime.getMinutes() + type.duration_minutes)

      onSlotSelect({
        start_time: selectedSlot.time,
        end_time: endTime,
        staff_id: selectedSlot.staff.id,
        staff_name: selectedSlot.staff.name,
      })
    }
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-10">
          <div className="w-full max-w-[240px] h-[60px] mx-auto mb-6 flex items-center justify-center">
            <h1 className="text-3xl font-bold text-[#6EC5FF]">TIMREXPLUS</h1>
          </div>
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-4">
            オンライン面談のご予約
          </h2>
          <p className="text-xl text-[#666666]">
            希望の日時を選択してください
          </p>
        </header>

        {/* 相談種別選択 */}
        <div className="mb-10">
          <label className="block text-base font-medium text-[#2D2D2D] mb-3">
            相談種別 <span className="text-[#FF7676]">*</span>
          </label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="h-14 text-base">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {consultationTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}（{type.duration_minutes}分）
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedType && (
          <>
            {/* 日付選択 */}
            <div className="mb-10">
            <label className="block text-base font-medium text-[#2D2D2D] mb-3">
              日付を選択 <span className="text-[#FF7676]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {dates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedSlot(null)
                  }}
                  className={`w-full py-4 px-6 rounded-md border-2 text-left transition-all tap-target ${
                    selectedDate && isSameDay(selectedDate, date)
                      ? "border-[#6EC5FF] bg-[#6EC5FF]/10 text-[#6EC5FF] font-medium"
                      : "border-gray-200 hover:border-[#6EC5FF]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">
                      {format(date, "M月d日", { locale: ja })}（{getWeekday(date)}）
                    </span>
                    {selectedDate && isSameDay(selectedDate, date) && (
                      <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 時間選択 */}
          {selectedDate && availableSlots.length > 0 && (
            <div className="mb-10">
              <label className="block text-base font-medium text-[#2D2D2D] mb-3">
                時間を選択 <span className="text-[#FF7676]">*</span>
              </label>
              <p className="text-sm text-[#666666] mb-4">
                各時間枠に空いているスタッフが表示されます
              </p>
              <div className="space-y-3">
                {availableSlots.map((slot) => {
                  if (slot.availableStaff.length === 0) {
                    // 空きなし
                    return (
                      <div
                        key={slot.time.toISOString()}
                        className="py-4 px-6 rounded-md border-2 border-gray-100 bg-gray-50 text-gray-400"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-medium">
                            {formatDate(slot.time, "HH:mm")}
                          </span>
                          <span className="text-base">空きなし</span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={slot.time.toISOString()} className="space-y-2">
                      <div className="text-base font-medium text-[#2D2D2D] px-2">
                        {formatDate(slot.time, "HH:mm")}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {slot.availableStaff.map((staff) => (
                          <button
                            key={staff.id}
                            onClick={() => handleSlotSelect(slot, staff)}
                            className={`py-4 px-6 rounded-md border-2 text-center transition-all tap-target ${
                              selectedSlot &&
                              selectedSlot.time.getTime() === slot.time.getTime() &&
                              selectedSlot.staff.id === staff.id
                                ? `bg-[${staff.color}] text-white font-medium`
                                : "border-gray-200 hover:border-[#6EC5FF]/50 bg-white"
                            }`}
                            style={
                              selectedSlot &&
                              selectedSlot.time.getTime() === slot.time.getTime() &&
                              selectedSlot.staff.id === staff.id
                                ? {
                                    backgroundColor: staff.color,
                                    borderColor: staff.color,
                                  }
                                : {}
                            }
                          >
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: staff.color }}
                              />
                              <span className="text-base font-medium">{staff.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 選択情報と次へボタン */}
      {selectedSlot && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-6 -mx-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6 p-6 bg-[#6EC5FF]/10 rounded-lg">
              <p className="text-base text-[#666666] mb-2">選択した日時</p>
              <p className="text-xl font-medium text-[#2D2D2D]">
                {formatDate(selectedSlot.time, "YYYY/MM/DD")}（{getWeekday(selectedSlot.time)}）{" "}
                {formatDate(selectedSlot.time, "HH:mm")}〜
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedSlot.staff.color }}
                />
                <p className="text-base text-[#666666]">
                  担当：<span className="font-medium text-[#2D2D2D]">{selectedSlot.staff.name}</span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleNext}
              className="w-full h-16 text-xl"
              variant="accent"
            >
              次へ進む
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
