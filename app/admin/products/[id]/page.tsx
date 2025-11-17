"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id?: string
  question_text: string
  question_type: string
  options: string[]
  is_required: boolean
  order_index: number
}

interface Product {
  id: string
  name: string
  description: string | null
  duration: number
  color: string
  is_active: boolean
  questions?: Question[]
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 30,
    color: "#6EC5FF",
    is_active: true,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      // 商材情報を取得
      const response = await fetch(`/api/admin/consultation-types/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        const consultationType = data.consultationType
        setFormData({
          name: consultationType.name,
          description: consultationType.description || "",
          duration: consultationType.duration_minutes || 30,
          color: consultationType.color || "#6EC5FF",
          is_active: consultationType.is_active,
        })
      }

      // 質問を取得
      const questionsResponse = await fetch(`/api/admin/consultation-types/${params.id}/questions`)
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        console.log("Fetched questions:", questionsData) // デバッグ用
        if (questionsData.questions && questionsData.questions.length > 0) {
          setQuestions(questionsData.questions.map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            options: q.options || [],
            is_required: q.is_required,
            order_index: q.order_index,
          })))
        }
      } else {
        const errorData = await questionsResponse.json()
        console.error("Failed to fetch questions:", errorData)
      }
    } catch (error) {
      console.error("Failed to fetch product:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: "",
      question_type: "text",
      options: [],
      is_required: false,
      order_index: questions.length,
    }
    setQuestions([...questions, newQuestion])
    // 新しい質問を自動で展開
    setExpandedQuestions(prev => new Set([...prev, questions.length]))
  }

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions(questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    ))
  }

  const addOption = (questionIndex: number) => {
    setQuestions(questions.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, options: [...q.options, ""] }
      }
      return q
    }))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions(questions.map((q, i) => {
      if (i === questionIndex) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions(questions.map((q, i) => {
      if (i === questionIndex) {
        return { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
      }
      return q
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "商材名を入力してください"
    }

    if (formData.duration < 15 || formData.duration > 480) {
      newErrors.duration = "所要時間は15分〜480分の範囲で入力してください"
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

      // 商材を更新
      const updateData = {
        name: formData.name,
        description: formData.description,
        duration_minutes: formData.duration,
        is_active: formData.is_active,
      }

      const productResponse = await fetch(`/api/admin/consultation-types/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (!productResponse.ok) {
        const data = await productResponse.json()
        setErrors({ submit: data.error || "商材の更新に失敗しました" })
        return
      }

      // 既存の質問を削除してから新しい質問を追加
      // TODO: より効率的な更新方法を実装

      // 質問を保存
      if (questions.length > 0) {
        const questionsToSave = questions.map((q, index) => ({
          question_text: q.question_text,
          question_type: q.question_type,
          options: ["radio", "checkbox", "select"].includes(q.question_type) ? q.options : [],
          is_required: q.is_required,
          order_index: index,
        }))

        console.log("Saving questions:", questionsToSave) // デバッグ用

        const questionsResponse = await fetch(`/api/admin/consultation-types/${params.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: questionsToSave }),
        })

        if (!questionsResponse.ok) {
          const errorData = await questionsResponse.json()
          console.error("Failed to update questions:", errorData)
          setErrors({ submit: `質問の更新に失敗しました: ${errorData.error || errorData.message}` })
          return
        }
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to update product:", error)
      setErrors({ submit: "商材の更新に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-4xl font-bold">商材編集</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          商材情報とフォームを編集
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                商材名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例：初回相談"
                className={`h-14 text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                説明
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="商材の説明"
                className="min-h-[100px] text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-base font-semibold">
                  所要時間（分） <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  min="15"
                  max="480"
                  className={`h-14 text-base ${errors.duration ? "border-destructive" : ""}`}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive mt-2">{errors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-base font-semibold">
                  カラー
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-14"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-base">
                この商材を有効にする
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">フォーム質問</CardTitle>
              <Button
                type="button"
                onClick={addQuestion}
                variant="outline"
                className="h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                質問を追加
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                質問が追加されていません
              </div>
            ) : (
              questions.map((question, index) => {
                const isExpanded = expandedQuestions.has(index)
                return (
                  <div key={index} className="border-2 rounded-lg overflow-hidden bg-white">
                    {/* アコーディオンヘッダー */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleQuestion(index)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-5 h-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">質問 {index + 1}</span>
                            {question.is_required && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded">
                                必須
                              </span>
                            )}
                          </div>
                          {question.question_text && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {question.question_text}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeQuestion(index)
                          }}
                          className="h-8 px-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* アコーディオンコンテンツ */}
                    {isExpanded && (
                      <div className="p-6 pt-0 space-y-4 border-t">
                        <div className="space-y-2">
                          <Label className="text-base font-semibold">質問文</Label>
                          <Input
                            value={question.question_text}
                            onChange={(e) => updateQuestion(index, "question_text", e.target.value)}
                            placeholder="質問を入力してください"
                            className="h-12 text-base"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-base font-semibold">回答形式</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { value: "text", label: "短文テキスト" },
                              { value: "textarea", label: "長文テキスト" },
                              { value: "radio", label: "ラジオボタン" },
                              { value: "checkbox", label: "チェックボックス" },
                              { value: "select", label: "プルダウン" },
                            ].map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => updateQuestion(index, "question_type", type.value)}
                                className={`px-4 py-3 text-sm font-medium rounded-md border-2 transition-colors ${
                                  question.question_type === type.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {type.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {["radio", "checkbox", "select"].includes(question.question_type) && (
                          <div className="space-y-3">
                            <Label className="text-base font-semibold">選択肢</Label>
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    placeholder={`選択肢 ${optionIndex + 1}`}
                                    className="h-10 text-base"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index, optionIndex)}
                                    className="h-10 px-3"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                              className="h-10 px-4 w-full sm:w-auto"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              選択肢を追加
                            </Button>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`required-${index}`}
                            checked={question.is_required}
                            onChange={(e) => updateQuestion(index, "is_required", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`required-${index}`} className="cursor-pointer text-sm">
                            必須回答
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {errors.submit && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded">
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="h-14 px-8 text-base font-semibold"
          >
            {saving ? "更新中..." : "変更を保存"}
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
    </div>
  )
}
