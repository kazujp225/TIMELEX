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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">相談種別管理</h1>
          <p className="text-muted-foreground mt-2">
            相談種別の追加・編集・削除を行います
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/consultation-types/new">+ 相談種別を追加</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>相談種別一覧（{consultationTypes.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {consultationTypes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>相談種別が登録されていません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultationTypes.map((type) => (
                <div
                  key={type.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{type.name}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            type.is_active
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {type.is_active ? "アクティブ" : "無効"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">時間:</span>{" "}
                          <span className="font-medium">{type.duration_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">前バッファ:</span>{" "}
                          <span className="font-medium">{type.buffer_before_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">後バッファ:</span>{" "}
                          <span className="font-medium">{type.buffer_after_minutes}分</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">表示順:</span>{" "}
                          <span className="font-medium">{type.display_order}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/consultation-types/${type.id}`}>
                          編集
                        </Link>
                      </Button>
                      <Button
                        variant={type.is_active ? "outline" : "default"}
                        size="sm"
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
