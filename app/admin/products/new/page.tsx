"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react"

interface Question {
  id: string
  question_text: string
  question_type: string
  options: string[]
  is_required: boolean
  order_index: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    display_order: 0,
  })
  const [questions, setQuestions] = useState<Question[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      question_text: "",
      question_type: "text",
      options: [],
      is_required: false,
      order_index: questions.length,
    }
    setQuestions([...questions, newQuestion])
    // 新しい質問を自動で展開
    setExpandedQuestions(prev => new Set([...prev, newQuestion.id]))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...q.options, ""] }
      }
      return q
    }))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options]
        newOptions[optionIndex] = value
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: q.options.filter((_, i) => i !== optionIndex) }
      }
      return q
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "商材名を入力してください"
    }

    if (formData.duration_minutes < 15 || formData.duration_minutes > 480) {
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

      // 商材を作成（consultation_types API使用）
      const productResponse = await fetch("/api/admin/consultation-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!productResponse.ok) {
        const data = await productResponse.json()
        setErrors({ submit: data.error || "商材の作成に失敗しました" })
        return
      }

      const { consultationType } = await productResponse.json()

      // 質問を作成（product_questionsテーブルに保存）
      if (questions.length > 0) {
        const questionsResponse = await fetch(`/api/admin/consultation-types/${consultationType.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions }),
        })

        if (!questionsResponse.ok) {
          console.error("Failed to create questions")
        }
      }

      router.push("/admin/products")
    } catch (error) {
      console.error("Failed to create product:", error)
      setErrors({ submit: "商材の作成に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-4xl font-bold">新規商材追加</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          新しい商材と専用フォームを作成
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
                className="min-h-[100px] text-base bg-white"
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
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                  min="15"
                  max="480"
                  className={`h-14 text-base ${errors.duration ? "border-destructive" : ""}`}
                />
                {errors.duration && (
                  <p className="text-sm text-destructive mt-2">{errors.duration}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="display_order" className="text-base font-semibold">
                  表示順序
                </Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  min="0"
                  className="h-14 text-base"
                />
                <p className="text-sm text-muted-foreground">
                  小さい数字ほど上に表示されます
                </p>
              </div>
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
                const isExpanded = expandedQuestions.has(question.id)
                return (
                  <div key={question.id} className="border-2 rounded-lg overflow-hidden bg-white">
                    {/* アコーディオンヘッダー */}
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleQuestion(question.id)}
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
                            removeQuestion(question.id)
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
                            onChange={(e) => updateQuestion(question.id, "question_text", e.target.value)}
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
                                onClick={() => updateQuestion(question.id, "question_type", type.value)}
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
                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                    placeholder={`選択肢 ${optionIndex + 1}`}
                                    className="h-10 text-base"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(question.id, optionIndex)}
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
                              onClick={() => addOption(question.id)}
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
                            id={`required-${question.id}`}
                            checked={question.is_required}
                            onChange={(e) => updateQuestion(question.id, "is_required", e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor={`required-${question.id}`} className="cursor-pointer text-sm">
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
            {saving ? "作成中..." : "商材を作成"}
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
