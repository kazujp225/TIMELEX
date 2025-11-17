"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ConsultationType } from "@/types"
import { ConsultationMode, RecentModeOverride } from "@/types"

export default function EditConsultationTypePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [consultationType, setConsultationType] = useState<ConsultationType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    mode: ConsultationMode.IMMEDIATE,
    recent_mode_override: RecentModeOverride.KEEP,
    display_order: 0,
    is_active: true,
    google_meet_url: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [questionnaires, setQuestionnaires] = useState<Array<{ id: string; name: string; consultation_type_id: string | null }>>([])
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<string>("")
  const [loadingQuestionnaires, setLoadingQuestionnaires] = useState(false)

  useEffect(() => {
    fetchConsultationType()
    fetchQuestionnaires()
  }, [params.id])

  const fetchConsultationType = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/consultation-types/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setConsultationType(data.consultationType)
        setFormData({
          name: data.consultationType.name,
          duration_minutes: data.consultationType.duration_minutes,
          buffer_before_minutes: data.consultationType.buffer_before_minutes,
          buffer_after_minutes: data.consultationType.buffer_after_minutes,
          mode: data.consultationType.mode,
          recent_mode_override: data.consultationType.recent_mode_override,
          display_order: data.consultationType.display_order,
          is_active: data.consultationType.is_active,
          google_meet_url: data.consultationType.google_meet_url || "",
        })
      } else {
        console.error("Failed to fetch consultation type")
        router.push("/admin/consultation-types")
      }
    } catch (error) {
      console.error("Failed to fetch consultation type:", error)
      router.push("/admin/consultation-types")
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionnaires = async () => {
    try {
      setLoadingQuestionnaires(true)
      const response = await fetch("/api/admin/questionnaires")
      if (response.ok) {
        const data = await response.json()
        setQuestionnaires(data.questionnaires || [])

        // Find questionnaire linked to this consultation type
        const linked = data.questionnaires.find((q: any) => q.consultation_type_id === params.id)
        if (linked) {
          setSelectedQuestionnaireId(linked.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch questionnaires:", error)
    } finally {
      setLoadingQuestionnaires(false)
    }
  }

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
      setSaving(true)

      // Update consultation type
      const response = await fetch(`/api/admin/consultation-types/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setErrors({ submit: data.error || "相談種別の更新に失敗しました" })
        return
      }

      // Update questionnaire association
      if (selectedQuestionnaireId) {
        await fetch(`/api/admin/questionnaires/${selectedQuestionnaireId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultation_type_id: params.id }),
        })
      }

      // Remove previous questionnaire association if changed
      const previousLinked = questionnaires.find((q) => q.consultation_type_id === params.id)
      if (previousLinked && previousLinked.id !== selectedQuestionnaireId) {
        await fetch(`/api/admin/questionnaires/${previousLinked.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ consultation_type_id: null }),
        })
      }

      router.push("/admin/consultation-types")
    } catch (error) {
      console.error("Failed to update consultation type:", error)
      setErrors({ submit: "相談種別の更新に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当にこの相談種別を削除しますか？この操作は取り消せません。")) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/consultation-types/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/consultation-types")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "相談種別の削除に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to delete consultation type:", error)
      setErrors({ submit: "相談種別の削除に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!consultationType) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold">相談種別を編集</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          {consultationType.name} の情報を編集します
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
              <Label htmlFor="questionnaire_id" className="text-base font-semibold">
                アンケート選択
              </Label>
              <Select
                value={selectedQuestionnaireId}
                onValueChange={(value) => setSelectedQuestionnaireId(value)}
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="アンケートなし" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto">
                  <SelectItem value="">アンケートなし</SelectItem>
                  {loadingQuestionnaires ? (
                    <SelectItem value="loading" disabled>読み込み中...</SelectItem>
                  ) : (
                    questionnaires.map((q) => (
                      <SelectItem key={q.id} value={q.id}>
                        {q.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                この商材に紐づけるアンケートを選択します（任意）
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

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-5 w-5 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-base">
                アクティブ（予約受付を有効にする）
              </Label>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="h-14 px-8 text-base font-semibold">
                {saving ? "保存中..." : "変更を保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="h-14 px-8 text-base font-semibold"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-destructive">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-destructive">危険な操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground">
            相談種別を削除すると、関連する予約履歴は保持されますが、新規予約ではこの種別を選択できなくなります。
          </p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
            className="h-14 px-8 text-base font-semibold"
          >
            相談種別を削除
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
