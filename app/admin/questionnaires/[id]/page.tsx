"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuestionnaireWithQuestions, ConsultationType } from "@/types"

export default function EditQuestionnairePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireWithQuestions | null>(null)
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    consultation_type_id: "",
    display_order: 0,
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [params.id])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch questionnaire
      const questionnaireResponse = await fetch(`/api/admin/questionnaires/${params.id}`)
      if (questionnaireResponse.ok) {
        const data = await questionnaireResponse.json()
        setQuestionnaire(data.questionnaire)
        setFormData({
          name: data.questionnaire.name,
          description: data.questionnaire.description || "",
          consultation_type_id: data.questionnaire.consultation_type_id || "",
          display_order: data.questionnaire.display_order,
          is_active: data.questionnaire.is_active,
        })
      } else {
        console.error("Failed to fetch questionnaire")
        router.push("/admin/questionnaires")
        return
      }

      // Fetch consultation types
      const typesResponse = await fetch("/api/admin/consultation-types")
      if (typesResponse.ok) {
        const typesData = await typesResponse.json()
        setConsultationTypes(typesData.consultationTypes || [])
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      router.push("/admin/questionnaires")
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "アンケート名を入力してください"
    } else if (formData.name.length > 100) {
      newErrors.name = "アンケート名は100文字以内で入力してください"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "説明は500文字以内で入力してください"
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

      const response = await fetch(`/api/admin/questionnaires/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/questionnaires")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "アンケートの更新に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to update questionnaire:", error)
      setErrors({ submit: "アンケートの更新に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当にこのアンケートを削除しますか？この操作は取り消せません。")) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/questionnaires/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/questionnaires")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "アンケートの削除に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to delete questionnaire:", error)
      setErrors({ submit: "アンケートの削除に失敗しました" })
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

  if (!questionnaire) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold">アンケートを編集</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          {questionnaire.name} の情報を編集します
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
                アンケート名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="例：初回相談アンケート"
                className={`h-14 text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                説明（任意）
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="アンケートの目的や内容を入力してください"
                className={`min-h-[100px] text-base ${errors.description ? "border-destructive" : ""}`}
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-2">{errors.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {formData.description.length}/500文字
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultation_type_id" className="text-base font-semibold">
                関連する相談種別（任意）
              </Label>
              <Select
                value={formData.consultation_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, consultation_type_id: value })
                }
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue placeholder="すべての相談種別" />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto">
                  <SelectItem value="">すべての相談種別</SelectItem>
                  {consultationTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-2">
                特定の相談種別にのみ表示する場合は選択してください
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
                アクティブ（予約フォームに表示する）
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

      {/* Questions Preview */}
      {questionnaire.questions && questionnaire.questions.length > 0 && (
        <Card className="border-2">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">質問一覧（{questionnaire.questions.length}件）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questionnaire.questions
                .sort((a, b) => a.display_order - b.display_order)
                .map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-base">
                          Q{index + 1}. {question.question_text}
                          {question.is_required && <span className="text-destructive ml-1">*</span>}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          種類: {question.question_type}
                        </p>
                        {question.help_text && (
                          <p className="text-sm text-muted-foreground mt-1">
                            ヘルプ: {question.help_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              ※ 質問の追加・編集機能は今後実装予定です
            </p>
          </CardContent>
        </Card>
      )}

      {/* Danger Zone */}
      <Card className="border-2 border-destructive">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-destructive">危険な操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base text-muted-foreground">
            アンケートを削除すると、関連する質問も削除されます。この操作は取り消せません。
          </p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
            className="h-14 px-8 text-base font-semibold"
          >
            アンケートを削除
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
