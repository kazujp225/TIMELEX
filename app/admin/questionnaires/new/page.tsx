"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { QuestionType } from "@/types"

// モックデータ
const MOCK_CONSULTATION_TYPES = [
  { id: "1", name: "初回相談" },
  { id: "2", name: "フォローアップ" },
]

interface QuestionForm {
  id: string
  question_text: string
  question_type: QuestionType
  options: string[]
  is_required: boolean
  placeholder: string
  help_text: string
}

export default function NewQuestionnairePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    consultation_type_id: "",
  })
  const [questions, setQuestions] = useState<QuestionForm[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, string | string[]>>({})

  // オートセーブ（ローカルストレージ）
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (formData.name || questions.length > 0) {
        localStorage.setItem(
          "questionnaire_draft",
          JSON.stringify({ formData, questions })
        )
        setLastSaved(new Date())
      }
    }, 2000)

    return () => clearTimeout(saveTimeout)
  }, [formData, questions])

  // ドラフトの復元
  useEffect(() => {
    const draft = localStorage.getItem("questionnaire_draft")
    if (draft) {
      try {
        const { formData: savedFormData, questions: savedQuestions } = JSON.parse(draft)
        toast("下書きを復元しますか？", {
          action: {
            label: "復元",
            onClick: () => {
              setFormData(savedFormData)
              setQuestions(savedQuestions)
              toast.success("下書きを復元しました")
            },
          },
          cancel: {
            label: "破棄",
            onClick: () => {
              localStorage.removeItem("questionnaire_draft")
            },
          },
        })
      } catch (error) {
        console.error("Failed to restore draft:", error)
      }
    }
  }, [])

  const addQuestion = () => {
    const newQuestion: QuestionForm = {
      id: `q-${Date.now()}`,
      question_text: "",
      question_type: QuestionType.TEXT,
      options: [],
      is_required: false,
      placeholder: "",
      help_text: "",
    }
    setQuestions([...questions, newQuestion])
    toast.success("質問を追加しました")
  }

  const updateQuestion = (id: string, updates: Partial<QuestionForm>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    )
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
    toast.success("質問を削除しました")
  }

  const moveQuestion = (id: string, direction: "up" | "down") => {
    const index = questions.findIndex((q) => q.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return
    }

    const newQuestions = [...questions]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ]
    setQuestions(newQuestions)
  }

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      updateQuestion(questionId, {
        options: [...question.options, ""],
      })
    }
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      updateQuestion(questionId, {
        options: question.options.filter((_, i) => i !== optionIndex),
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "アンケート名を入力してください"
    }

    if (questions.length === 0) {
      newErrors.questions = "少なくとも1つの質問を追加してください"
    }

    questions.forEach((q, index) => {
      if (!q.question_text.trim()) {
        newErrors[`question_${index}_text`] = "質問文を入力してください"
      }

      if (["radio", "checkbox", "select"].includes(q.question_type)) {
        if (q.options.length === 0) {
          newErrors[`question_${index}_options`] = "選択肢を追加してください"
        } else if (q.options.some((opt) => !opt.trim())) {
          newErrors[`question_${index}_options`] = "空の選択肢があります"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("入力内容を確認してください")
      return
    }

    // モック保存
    const loadingToast = toast.loading("アンケートを作成しています...")

    setTimeout(() => {
      console.log("保存データ:", {
        ...formData,
        questions: questions.map((q, index) => ({
          ...q,
          display_order: index,
        })),
      })

      localStorage.removeItem("questionnaire_draft")
      toast.success(`「${formData.name}」を作成しました`, {
        id: loadingToast,
      })

      setTimeout(() => {
        router.push("/admin/questionnaires")
      }, 500)
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#2D2D2D]">アンケート新規作成</h1>
          <p className="text-sm text-[#666666] mt-1">
            事前アンケートの基本情報と質問を設定してください
          </p>
        </div>
        {lastSaved && (
          <div className="flex items-center gap-2 text-xs text-[#999999] bg-gray-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse" />
            <span>
              {new Date(lastSaved).toLocaleTimeString("ja-JP", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              に保存
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <h2 className="text-lg font-semibold text-[#2D2D2D]">基本情報</h2>

          <div>
            <Label htmlFor="name">
              アンケート名 <span className="text-[#FF7676]">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例: 初回相談用アンケート"
              className={errors.name ? "border-[#FF7676]" : ""}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-[#FF7676]">{errors.name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">説明（任意）</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="このアンケートの目的や用途を記入してください"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="consultation_type_id">対象の相談種別（任意）</Label>
            <Select
              value={formData.consultation_type_id}
              onValueChange={(value) =>
                setFormData({ ...formData, consultation_type_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="全種別で使用（選択なし）" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全種別で使用</SelectItem>
                {MOCK_CONSULTATION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-[#999999]">
              特定の相談種別にのみ表示したい場合は選択してください
            </p>
          </div>
        </div>

        {/* 質問リスト */}
        <div className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2D2D2D]">質問設定</h2>
            <Button
              type="button"
              variant="outline"
              onClick={addQuestion}
              className="transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              質問を追加
            </Button>
          </div>

          {errors.questions && (
            <p className="text-sm text-[#FF7676]">{errors.questions}</p>
          )}

          {questions.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed rounded-lg animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Plus className="h-8 w-8 text-[#999999]" />
              </div>
              <p className="text-[#999999] mb-2 text-lg">まだ質問が追加されていません</p>
              <p className="text-sm text-[#CCCCCC] mb-6">
                質問を追加して、クライアントに事前に確認したい情報を設定しましょう
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={addQuestion}
                className="transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                最初の質問を追加
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  <QuestionBuilder
                    question={question}
                    index={index}
                    totalQuestions={questions.length}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                    onDelete={() => deleteQuestion(question.id)}
                    onMove={(direction) => moveQuestion(question.id, direction)}
                    onAddOption={() => addOption(question.id)}
                    onUpdateOption={(optionIndex, value) =>
                      updateOption(question.id, optionIndex, value)
                    }
                    onDeleteOption={(optionIndex) =>
                      deleteOption(question.id, optionIndex)
                    }
                    errors={errors}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 sticky bottom-0 bg-white p-4 border-t">
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                disabled={questions.length === 0}
                className="transition-all duration-200 hover:scale-105"
              >
                <Eye className="h-4 w-4 mr-2" />
                プレビュー
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>アンケートプレビュー</DialogTitle>
                <DialogDescription>
                  クライアントに表示される画面のプレビューです
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {formData.name && (
                  <div>
                    <h3 className="text-lg font-semibold text-[#2D2D2D]">
                      {formData.name}
                    </h3>
                    {formData.description && (
                      <p className="text-sm text-[#666666] mt-1">
                        {formData.description}
                      </p>
                    )}
                  </div>
                )}

                {questions.length === 0 ? (
                  <div className="py-8 text-center text-[#999999]">
                    質問が設定されていません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-base">
                          {question.question_text}
                          {question.is_required && (
                            <span className="text-[#FF7676] ml-1">*</span>
                          )}
                        </Label>
                        {question.help_text && (
                          <p className="text-sm text-[#666666]">
                            {question.help_text}
                          </p>
                        )}

                        {/* 質問タイプ別のプレビュー */}
                        {question.question_type === "text" && (
                          <Input
                            placeholder={question.placeholder || "回答を入力"}
                            value={previewAnswers[question.id] as string || ""}
                            onChange={(e) =>
                              setPreviewAnswers({
                                ...previewAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                          />
                        )}

                        {question.question_type === "textarea" && (
                          <Textarea
                            placeholder={question.placeholder || "回答を入力"}
                            value={previewAnswers[question.id] as string || ""}
                            onChange={(e) =>
                              setPreviewAnswers({
                                ...previewAnswers,
                                [question.id]: e.target.value,
                              })
                            }
                            rows={4}
                          />
                        )}

                        {question.question_type === "radio" && (
                          <div className="space-y-2">
                            {question.options.map((option, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id={`preview-${question.id}-${i}`}
                                  name={`preview-${question.id}`}
                                  value={option}
                                  checked={previewAnswers[question.id] === option}
                                  onChange={(e) =>
                                    setPreviewAnswers({
                                      ...previewAnswers,
                                      [question.id]: e.target.value,
                                    })
                                  }
                                  className="w-4 h-4"
                                />
                                <label
                                  htmlFor={`preview-${question.id}-${i}`}
                                  className="text-sm"
                                >
                                  {option}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.question_type === "checkbox" && (
                          <div className="space-y-2">
                            {question.options.map((option, i) => {
                              const answers = Array.isArray(previewAnswers[question.id])
                                ? previewAnswers[question.id] as string[]
                                : []
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <Checkbox
                                    id={`preview-${question.id}-${i}`}
                                    checked={answers.includes(option)}
                                    onCheckedChange={(checked) => {
                                      const newAnswers = checked
                                        ? [...answers, option]
                                        : answers.filter((a) => a !== option)
                                      setPreviewAnswers({
                                        ...previewAnswers,
                                        [question.id]: newAnswers,
                                      })
                                    }}
                                  />
                                  <label
                                    htmlFor={`preview-${question.id}-${i}`}
                                    className="text-sm"
                                  >
                                    {option}
                                  </label>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {question.question_type === "select" && (
                          <Select
                            value={previewAnswers[question.id] as string || ""}
                            onValueChange={(value) =>
                              setPreviewAnswers({
                                ...previewAnswers,
                                [question.id]: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="選択してください" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options.map((option, i) => (
                                <SelectItem key={i} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            type="submit"
            className="flex-1 transition-all duration-200 hover:scale-105 hover:shadow-md"
          >
            アンケートを作成
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 transition-all duration-200 hover:scale-105"
          >
            キャンセル
          </Button>
        </div>
      </form>
    </div>
  )
}

function QuestionBuilder({
  question,
  index,
  totalQuestions,
  onUpdate,
  onDelete,
  onMove,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  errors,
}: {
  question: QuestionForm
  index: number
  totalQuestions: number
  onUpdate: (updates: Partial<QuestionForm>) => void
  onDelete: () => void
  onMove: (direction: "up" | "down") => void
  onAddOption: () => void
  onUpdateOption: (optionIndex: number, value: string) => void
  onDeleteOption: (optionIndex: number) => void
  errors: Record<string, string>
}) {
  const [isExpanded, setIsExpanded] = useState(true)

  const needsOptions = ["radio", "checkbox", "select"].includes(question.question_type)

  return (
    <div className="border rounded-lg p-4 bg-gray-50 transition-all duration-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        {/* 並び替えボタン */}
        <div className="flex flex-col gap-1 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="h-6 w-6 p-0 transition-all duration-200 hover:scale-110"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <GripVertical className="h-4 w-4 text-[#999999]" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onMove("down")}
            disabled={index === totalQuestions - 1}
            className="h-6 w-6 p-0 transition-all duration-200 hover:scale-110"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* 質問内容 */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-[#2D2D2D]">質問 {index + 1}</h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="transition-all duration-200 hover:scale-105"
              >
                {isExpanded ? "折りたたむ" : "展開"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="transition-all duration-200 hover:scale-110"
              >
                <Trash2 className="h-4 w-4 text-[#FF7676]" />
              </Button>
            </div>
          </div>

          {isExpanded && (
            <>
              <div>
                <Label>
                  質問文 <span className="text-[#FF7676]">*</span>
                </Label>
                <Input
                  value={question.question_text}
                  onChange={(e) => onUpdate({ question_text: e.target.value })}
                  placeholder="質問を入力してください"
                  className={
                    errors[`question_${index}_text`] ? "border-[#FF7676]" : ""
                  }
                />
                {errors[`question_${index}_text`] && (
                  <p className="mt-1 text-sm text-[#FF7676]">
                    {errors[`question_${index}_text`]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>質問タイプ</Label>
                  <Select
                    value={question.question_type}
                    onValueChange={(value: QuestionType) =>
                      onUpdate({ question_type: value, options: [] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">短文入力</SelectItem>
                      <SelectItem value="textarea">長文入力</SelectItem>
                      <SelectItem value="radio">ラジオボタン（単一選択）</SelectItem>
                      <SelectItem value="checkbox">
                        チェックボックス（複数選択）
                      </SelectItem>
                      <SelectItem value="select">
                        プルダウン（単一選択）
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id={`required-${question.id}`}
                    checked={question.is_required}
                    onCheckedChange={(checked) =>
                      onUpdate({ is_required: !!checked })
                    }
                  />
                  <Label htmlFor={`required-${question.id}`} className="font-normal">
                    必須項目
                  </Label>
                </div>
              </div>

              {needsOptions && (
                <div>
                  <Label>
                    選択肢 <span className="text-[#FF7676]">*</span>
                  </Label>
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => onUpdateOption(optionIndex, e.target.value)}
                          placeholder={`選択肢 ${optionIndex + 1}`}
                          className={
                            errors[`question_${index}_options`]
                              ? "border-[#FF7676]"
                              : ""
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteOption(optionIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddOption}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      選択肢を追加
                    </Button>
                  </div>
                  {errors[`question_${index}_options`] && (
                    <p className="mt-1 text-sm text-[#FF7676]">
                      {errors[`question_${index}_options`]}
                    </p>
                  )}
                </div>
              )}

              {(question.question_type === "text" ||
                question.question_type === "textarea") && (
                <div>
                  <Label>プレースホルダー（任意）</Label>
                  <Input
                    value={question.placeholder}
                    onChange={(e) => onUpdate({ placeholder: e.target.value })}
                    placeholder="例: ここに入力してください"
                  />
                </div>
              )}

              <div>
                <Label>ヘルプテキスト（任意）</Label>
                <Input
                  value={question.help_text}
                  onChange={(e) => onUpdate({ help_text: e.target.value })}
                  placeholder="この質問の補足説明や注意事項"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
