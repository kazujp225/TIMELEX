"use client"

import { useState } from "react"
import { format, addDays, startOfDay, isSameDay } from "date-fns"
import { ja } from "date-fns/locale"
import { Card } from "@/components/ui/card"
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
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)

  // 今日から7日分の日付を生成
  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))

  // 仮の時間枠データ
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

  const handleNext = () => {
    if (selectedDate && selectedTime && selectedType) {
      const type = consultationTypes.find((t) => t.id === selectedType)
      if (!type) return

      const endTime = new Date(selectedTime)
      endTime.setMinutes(endTime.getMinutes() + type.duration_minutes)

      onSlotSelect({
        start_time: selectedTime,
        end_time: endTime,
        staff_id: "staff-1",
        staff_name: "スタッフA",
      })
    }
  }

  return (
    <div className="container-custom py-8">
      {/* ヘッダー */}
      <header className="text-center mb-8">
        <div className="w-full max-w-[200px] h-[50px] mx-auto mb-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-[#6EC5FF]">TIMREXPLUS</h1>
        </div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          オンライン面談のご予約
        </h2>
        <p className="text-base text-[#666666]">
          希望の日時を選択してください
        </p>
      </header>

      {/* 相談種別選択 */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
          相談種別 <span className="text-[#FF7676]">*</span>
        </label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
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
          <div className="mb-8">
            <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
              日付を選択 <span className="text-[#FF7676]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {dates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => {
                    setSelectedDate(date)
                    setSelectedTime(null)
                  }}
                  className={`w-full py-3 px-4 rounded-md border-2 text-left transition-all tap-target ${
                    selectedDate && isSameDay(selectedDate, date)
                      ? "border-[#6EC5FF] bg-[#6EC5FF]/10 text-[#6EC5FF] font-medium"
                      : "border-gray-200 hover:border-[#6EC5FF]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">
                      {format(date, "M月d日", { locale: ja })}（{getWeekday(date)}）
                    </span>
                    {selectedDate && isSameDay(selectedDate, date) && (
                      <svg
                        className="w-5 h-5"
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
          {selectedDate && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#2D2D2D] mb-2">
                時間を選択 <span className="text-[#FF7676]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map(({ hour, minute }) => {
                  const slotTime = new Date(selectedDate)
                  slotTime.setHours(hour, minute, 0, 0)

                  return (
                    <button
                      key={`${hour}-${minute}`}
                      onClick={() => setSelectedTime(slotTime)}
                      className={`py-3 px-4 rounded-md border-2 text-center transition-all tap-target ${
                        selectedTime && selectedTime.getTime() === slotTime.getTime()
                          ? "border-[#FFC870] bg-[#FFC870] text-white font-medium"
                          : "border-gray-200 hover:border-[#6EC5FF]/50 bg-white"
                      }`}
                    >
                      {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* 選択情報と次へボタン */}
      {selectedTime && (
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t-2 border-gray-100 p-4 -mx-4">
          <div className="container-custom">
            <div className="mb-4 p-4 bg-[#6EC5FF]/10 rounded-md">
              <p className="text-sm text-[#666666] mb-1">選択した日時</p>
              <p className="text-lg font-medium text-[#2D2D2D]">
                {formatDate(selectedTime, "YYYY/MM/DD")}（{getWeekday(selectedTime)}）{" "}
                {formatDate(selectedTime, "HH:mm")}〜
              </p>
            </div>
            <Button
              onClick={handleNext}
              className="w-full h-14 text-lg"
              variant="accent"
            >
              次へ進む
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
