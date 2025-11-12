"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ConsultationType } from "@/types"
import Link from "next/link"

export default function ConsultationTypesPage() {
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultationTypes()
  }, [])

  const fetchConsultationTypes = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/consultation-types")
      if (response.ok) {
        const data = await response.json()
        setConsultationTypes(data.consultationTypes || [])
      }
    } catch (error) {
      console.error("Failed to fetch consultation types:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/consultation-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        await fetchConsultationTypes()
      }
    } catch (error) {
      console.error("Failed to toggle status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">相談種別管理</h1>
          <p className="text-muted-foreground mt-2 sm:mt-3 text-base sm:text-lg">
            相談種別の追加・編集・削除を行います
          </p>
        </div>

        <Button asChild className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold w-full sm:w-auto">
          <Link href="/admin/consultation-types/new">+ 相談種別を追加</Link>
        </Button>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">相談種別一覧（{consultationTypes.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {consultationTypes.length === 0 ? (
            <div className="text-center py-8 sm:py-16 text-muted-foreground">
              <p className="text-base sm:text-lg">相談種別が登録されていません</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {consultationTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-4 sm:p-6 border-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <h3 className="text-lg sm:text-xl font-semibold">{type.name}</h3>
                        <span
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded ${
                            type.is_active
                              ? "bg-success/10 text-success font-semibold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {type.is_active ? "アクティブ" : "無効"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base">
                        <div>
                          <span className="text-muted-foreground">時間:</span>{" "}
                          <span className="font-semibold">{type.duration_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">前バッファ:</span>{" "}
                          <span className="font-semibold">{type.buffer_before_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">後バッファ:</span>{" "}
                          <span className="font-semibold">{type.buffer_after_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">表示順:</span>{" "}
                          <span className="font-semibold">{type.display_order}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base flex-1"
                        asChild
                      >
                        <Link href={`/admin/consultation-types/${type.id}`}>
                          編集
                        </Link>
                      </Button>
                      <Button
                        variant={type.is_active ? "outline" : "default"}
                        className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base flex-1"
                        onClick={() => toggleStatus(type.id, type.is_active)}
                      >
                        {type.is_active ? "無効化" : "有効化"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
