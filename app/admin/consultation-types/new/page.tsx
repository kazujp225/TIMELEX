"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConsultationMode, RecentModeOverride } from "@/types"

export default function NewConsultationTypePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    mode: ConsultationMode.IMMEDIATE,
    recent_mode_override: RecentModeOverride.KEEP,
    display_order: 0,
    google_meet_url: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "相談種別名を入力してください"
    } else if (formData.name.length > 100) {
      newErrors.name = "相談種別名は100文字以内で入力してください"
    }

    if (formData.duration_minutes < 1) {
      newErrors.duration_minutes = "所要時間は1分以上で入力してください"
    } else if (formData.duration_minutes > 480) {
      newErrors.duration_minutes = "所要時間は480分以内で入力してください"
    }

    if (formData.buffer_before_minutes < 0) {
      newErrors.buffer_before_minutes = "前バッファは0分以上で入力してください"
    } else if (formData.buffer_before_minutes > 60) {
      newErrors.buffer_before_minutes = "前バッファは60分以内で入力してください"
    }

    if (formData.buffer_after_minutes < 0) {
      newErrors.buffer_after_minutes = "後バッファは0分以上で入力してください"
    } else if (formData.buffer_after_minutes > 60) {
      newErrors.buffer_after_minutes = "後バッファは60分以内で入力してください"
    }

    // Google Meet URLのバリデーション
    if (formData.google_meet_url && formData.google_meet_url.trim()) {
      const meetUrlPattern = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/
      if (!meetUrlPattern.test(formData.google_meet_url.trim())) {
        newErrors.google_meet_url = "正しいGoogle Meet URLを入力してください（例: https://meet.google.com/abc-defg-hij）"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setLoading(true)

      // TODO: Call API to create consultation type
      const response = await fetch("/api/admin/consultation-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/consultation-types")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "相談種別の作成に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to create consultation type:", error)
      setErrors({ submit: "相談種別の作成に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold">相談種別を追加</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          新しい相談種別を登録します
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                相談種別名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例：初回相談（AI導入）"
                className={`h-14 text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes" className="text-base font-semibold">
                所要時間（分） <span className="text-destructive">*</span>
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                max="480"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })
                }
                className={`h-14 text-base ${errors.duration_minutes ? "border-destructive" : ""}`}
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive mt-2">{errors.duration_minutes}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                1〜480分の範囲で設定してください
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="buffer_before_minutes" className="text-base font-semibold">
                  前バッファ（分）
                </Label>
                <Input
                  id="buffer_before_minutes"
                  type="number"
                  min="0"
                  max="60"
                  value={formData.buffer_before_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, buffer_before_minutes: parseInt(e.target.value) || 0 })
                  }
                  className={`h-14 text-base ${errors.buffer_before_minutes ? "border-destructive" : ""}`}
                />
                {errors.buffer_before_minutes && (
                  <p className="text-sm text-destructive mt-2">{errors.buffer_before_minutes}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  予約前の準備時間
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="buffer_after_minutes" className="text-base font-semibold">
                  後バッファ（分）
                </Label>
                <Input
                  id="buffer_after_minutes"
                  type="number"
                  min="0"
                  max="60"
                  value={formData.buffer_after_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, buffer_after_minutes: parseInt(e.target.value) || 0 })
                  }
                  className={`h-14 text-base ${errors.buffer_after_minutes ? "border-destructive" : ""}`}
                />
                {errors.buffer_after_minutes && (
                  <p className="text-sm text-destructive mt-2">{errors.buffer_after_minutes}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  予約後の整理時間
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode" className="text-base font-semibold">予約モード</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) =>
                  setFormData({ ...formData, mode: value as ConsultationMode })
                }
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto">
                  <SelectItem value={ConsultationMode.IMMEDIATE}>即時確定</SelectItem>
                  <SelectItem value={ConsultationMode.MANUAL}>手動承認</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                即時確定：予約と同時に確定 / 手動承認：管理者が承認後に確定
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recent_mode_override" className="text-base font-semibold">
                継続顧客のモード上書き
              </Label>
              <Select
                value={formData.recent_mode_override}
                onValueChange={(value) =>
                  setFormData({ ...formData, recent_mode_override: value as RecentModeOverride })
                }
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto">
                  <SelectItem value={RecentModeOverride.KEEP}>モードを維持</SelectItem>
                  <SelectItem value={RecentModeOverride.SWITCH_TO_MANUAL}>手動承認に切り替え</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                30日以内に予約した継続顧客の扱いを設定
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_meet_url" className="text-base font-semibold">
                Google Meet URL（固定）
              </Label>
              <Input
                id="google_meet_url"
                type="url"
                value={formData.google_meet_url}
                onChange={(e) =>
                  setFormData({ ...formData, google_meet_url: e.target.value })
                }
                placeholder="https://meet.google.com/abc-defg-hij"
                className={`h-14 text-base ${errors.google_meet_url ? "border-destructive" : ""}`}
              />
              {errors.google_meet_url && (
                <p className="text-sm text-destructive mt-2">{errors.google_meet_url}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                この商材専用の固定Google Meet URLを設定します（任意）
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Google Meetで会議室を作成し、固定URLをコピーしてください
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order" className="text-base font-semibold">
                表示順序
              </Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                }
                className="h-14 text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                小さい数字ほど上に表示されます
              </p>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="h-14 px-8 text-base font-semibold">
                {loading ? "作成中..." : "相談種別を追加"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
                className="h-14 px-8 text-base font-semibold"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
