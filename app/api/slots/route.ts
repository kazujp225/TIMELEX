import { NextRequest, NextResponse } from "next/server"
import { calculateAvailableSlots } from "@/lib/google/calendar"
import { staffDb } from "@/lib/supabase/database"

export const dynamic = 'force-dynamic'

/**
 * GET /api/slots
 * 空き枠を取得
 *
 * クエリパラメータ:
 * - consultation_type_id: 相談種別ID（必須）
 * - start_date: 開始日（任意、デフォルト: 今日）
 * - end_date: 終了日（任意、デフォルト: 60日後）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const consultationTypeId = searchParams.get("consultation_type_id")

    if (!consultationTypeId) {
      return NextResponse.json(
        { error: "consultation_type_id is required" },
        { status: 400 }
      )
    }

    // 日付範囲を設定
    const startDate = searchParams.get("start_date")
      ? new Date(searchParams.get("start_date")!)
      : new Date()

    const endDate = searchParams.get("end_date")
      ? new Date(searchParams.get("end_date")!)
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60日後

    // アクティブなスタッフを取得
    const staff = await staffDb.getActiveStaff()

    if (staff.length === 0) {
      return NextResponse.json(
        { error: "No active staff available" },
        { status: 404 }
      )
    }

    // 各スタッフの空き枠を取得
    const allSlots: Array<{
      start_time: Date
      end_time: Date
      staff_id: string
      staff_name: string
    }> = []

    for (const s of staff) {
      try {
        const slots = await calculateAvailableSlots(
          s.id,
          consultationTypeId,
          startDate,
          endDate
        )

        for (const slot of slots) {
          allSlots.push({
            start_time: slot.start,
            end_time: slot.end,
            staff_id: s.id,
            staff_name: s.name,
          })
        }
      } catch (error) {
        console.error(`Error calculating slots for staff ${s.name}:`, error)
        // スタッフのエラーは無視して続行
      }
    }

    // 開始時刻でソート
    allSlots.sort((a, b) => a.start_time.getTime() - b.start_time.getTime())

    // 同一時刻の重複を削除（ラウンドロビン配分）
    const uniqueSlots: typeof allSlots = []
    const usedTimes = new Set<string>()
    const staffLastAssigned = new Map<string, number>()

    for (const slot of allSlots) {
      const timeKey = slot.start_time.toISOString()

      if (!usedTimes.has(timeKey)) {
        uniqueSlots.push(slot)
        usedTimes.add(timeKey)
        staffLastAssigned.set(slot.staff_id, slot.start_time.getTime())
      } else {
        // 同一時刻の場合、前回の割り当てが古いスタッフを優先
        const existingIndex = uniqueSlots.findIndex(
          (s) => s.start_time.toISOString() === timeKey
        )

        if (existingIndex !== -1) {
          const existingSlot = uniqueSlots[existingIndex]
          const existingLastTime = staffLastAssigned.get(existingSlot.staff_id) || 0
          const currentLastTime = staffLastAssigned.get(slot.staff_id) || 0

          // より前に割り当てられたスタッフに交代
          if (currentLastTime < existingLastTime) {
            uniqueSlots[existingIndex] = slot
            staffLastAssigned.set(slot.staff_id, slot.start_time.getTime())
          }
        }
      }
    }

    return NextResponse.json({
      slots: uniqueSlots,
      count: uniqueSlots.length,
    })
  } catch (error) {
    console.error("Error fetching available slots:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch available slots",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
