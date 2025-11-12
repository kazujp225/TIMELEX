"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { InquirySource } from "@/types"

export default function InquirySourcesPage() {
  const [inquirySources, setInquirySources] = useState<InquirySource[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newSource, setNewSource] = useState({ name: "", description: "", display_order: 0 })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchInquirySources()
  }, [])

  const fetchInquirySources = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/inquiry-sources")
      if (response.ok) {
        const data = await response.json()
        setInquirySources(data.inquirySources || [])
      }
    } catch (error) {
      console.error("Failed to fetch inquiry sources:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const newErrors: Record<string, string> = {}

      if (!newSource.name.trim()) {
        newErrors.name = "名前を入力してください"
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      const response = await fetch("/api/admin/inquiry-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSource),
      })

      if (response.ok) {
        setNewSource({ name: "", description: "", display_order: 0 })
        setIsAdding(false)
        setErrors({})
        await fetchInquirySources()
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "追加に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to add inquiry source:", error)
      setErrors({ submit: "追加に失敗しました" })
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/inquiry-sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        await fetchInquirySources()
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">お問い合わせ元管理</h1>
          <p className="text-muted-foreground mt-2 sm:mt-3 text-base sm:text-lg">
            お問い合わせ元の追加・編集・削除を行います
          </p>
        </div>

        <Button onClick={() => setIsAdding(!isAdding)} className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">
          {isAdding ? "キャンセル" : "+ お問い合わせ元を追加"}
        </Button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <Card className="border-2">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl">新規追加</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div>
              <label className="text-sm sm:text-base font-semibold mb-2 block">
                名前 <span className="text-destructive">*</span>
              </label>
              <Input
                value={newSource.name}
                onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                placeholder="例: 公式サイト"
                className={`h-12 sm:h-14 text-sm sm:text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="text-sm sm:text-base font-semibold mb-2 block">説明</label>
              <Input
                value={newSource.description}
                onChange={(e) => setNewSource({ ...newSource, description: e.target.value })}
                placeholder="例: コーポレートサイトからのお問い合わせ"
                className="h-12 sm:h-14 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="text-sm sm:text-base font-semibold mb-2 block">表示順</label>
              <Input
                type="number"
                value={newSource.display_order}
                onChange={(e) => setNewSource({ ...newSource, display_order: parseInt(e.target.value) || 0 })}
                min="0"
                className="h-12 sm:h-14 text-sm sm:text-base"
              />
            </div>

            {errors.submit && (
              <div className="p-3 sm:p-4 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm sm:text-base text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button onClick={handleAdd} className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base flex-1">追加</Button>
              <Button variant="outline" onClick={() => {
                setIsAdding(false)
                setNewSource({ name: "", description: "", display_order: 0 })
                setErrors({})
              }} className="h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base flex-1">
                キャンセル
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      <Card className="border-2">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">お問い合わせ元一覧（{inquirySources.length}件）</CardTitle>
        </CardHeader>
        <CardContent>
          {inquirySources.length === 0 ? (
            <div className="text-center py-8 sm:py-16 text-muted-foreground">
              <p className="text-base sm:text-lg">お問い合わせ元が登録されていません</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {inquirySources.map((source) => (
                <div
                  key={source.id}
                  className="p-4 sm:p-6 border-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                        <h3 className="text-lg sm:text-xl font-semibold">{source.name}</h3>
                        <span
                          className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded ${
                            source.is_active
                              ? "bg-success/10 text-success font-semibold"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {source.is_active ? "アクティブ" : "無効"}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          表示順: {source.display_order}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={source.is_active ? "outline" : "default"}
                      className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full sm:w-auto"
                      onClick={() => toggleStatus(source.id, source.is_active)}
                    >
                      {source.is_active ? "無効化" : "有効化"}
                    </Button>
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
