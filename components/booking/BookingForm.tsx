"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { validateEmail, formatDate, getWeekday } from "@/lib/utils"
import { QuestionnaireForm } from "@/components/booking/QuestionnaireForm"
import { QuestionType } from "@/types"
import type { ConsultationType, InquirySource, Question } from "@/types"

interface BookingFormProps {
  selectedSlot: {
    start_time: Date
    end_time: Date
    staff_id: string
    staff_name: string
  }
  consultationTypes: ConsultationType[]
  inquirySources: InquirySource[]
  onSubmit: (bookingId: string) => void
  onBack: () => void
}

// モックアンケートデータ
const MOCK_QUESTIONS: Question[] = [
  {
    id: "q1",
    questionnaire_id: "questionnaire-1",
    question_text: "ご相談の目的を教えてください",
    question_type: QuestionType.TEXTAREA,
    is_required: true,
    display_order: 0,
    placeholder: "例: 新規事業の立ち上げについて相談したい",
    help_text: "できるだけ具体的にご記入ください",
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "q2",
    questionnaire_id: "questionnaire-1",
    question_text: "ご相談の緊急度はどの程度ですか？",
    question_type: QuestionType.RADIO,
    options: [
      "できるだけ早く対応してほしい",
      "1週間以内に対応してほしい",
      "1ヶ月以内に対応してほしい",
      "特に急ぎではない",
    ],
    is_required: true,
    display_order: 1,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "q3",
    questionnaire_id: "questionnaire-1",
    question_text: "当社をどこでお知りになりましたか？（複数選択可）",
    question_type: QuestionType.CHECKBOX,
    options: ["検索エンジン", "SNS", "知人の紹介", "広告", "その他"],
    is_required: false,
    display_order: 2,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

export function BookingForm({
  selectedSlot,
  consultationTypes,
  inquirySources,
  onSubmit,
  onBack,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    inquiry_source_id: "",
    client_company: "",
    client_memo: "",
    reminder_24h_enabled: true,
    reminder_30m_enabled: true,
  })

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<
    Record<string, string | string[]>
  >({})

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // エラーをクリア
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client_name.trim()) {
      newErrors.client_name = "お名前を入力してください"
    } else if (formData.client_name.length > 50) {
      newErrors.client_name = "お名前は50文字以内で入力してください"
    }

    if (!formData.client_email.trim()) {
      newErrors.client_email = "メールアドレスを入力してください"
    } else if (!validateEmail(formData.client_email)) {
      newErrors.client_email = "正しいメールアドレスを入力してください"
    } else if (formData.client_email.length > 100) {
      newErrors.client_email = "メールアドレスは100文字以内で入力してください"
    }

    if (!formData.inquiry_source_id) {
      newErrors.inquiry_source_id = "お問い合わせ元を選択してください"
    }

    if (formData.client_company.length > 100) {
      newErrors.client_company = "会社名は100文字以内で入力してください"
    }

    if (formData.client_memo.length > 500) {
      newErrors.client_memo = "メモは500文字以内で入力してください"
    }

    // アンケート回答のバリデーション
    MOCK_QUESTIONS.forEach((question) => {
      if (question.is_required) {
        const answer = questionnaireAnswers[question.id]
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          newErrors[question.id] = "この質問は必須です"
        } else if (typeof answer === "string" && !answer.trim()) {
          newErrors[question.id] = "この質問は必須です"
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: APIリクエスト
      console.log("予約データ（モック）:", {
        ...formData,
        questionnaire_answers: questionnaireAnswers,
      })

      // 仮の成功レスポンス
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const bookingId = "booking-" + Math.random().toString(36).substr(2, 9)
      onSubmit(bookingId)
    } catch (error) {
      console.error("予約エラー:", error)
      alert("予約に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container-custom py-8">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6EC5FF] text-white flex items-center justify-center text-sm font-medium">
              ✓
            </div>
            <span className="text-sm text-[#666666]">日時選択</span>
          </div>
          <div className="w-8 h-0.5 bg-[#6EC5FF]" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#6EC5FF] text-white flex items-center justify-center text-sm font-medium">
              2
            </div>
            <span className="text-sm font-medium text-[#2D2D2D]">情報入力</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-medium">
              3
            </div>
            <span className="text-sm text-[#666666]">確認</span>
          </div>
        </div>
      </div>

      {/* 選択した日時の表示 */}
      <div className="mb-6 p-4 bg-[#6EC5FF]/10 rounded-lg">
        <p className="text-sm text-[#666666] mb-1">予約日時</p>
        <p className="text-lg font-medium text-[#2D2D2D]">
          {formatDate(selectedSlot.start_time, "YYYY/MM/DD")}（
          {getWeekday(selectedSlot.start_time)}）{" "}
          {formatDate(selectedSlot.start_time, "HH:mm")}〜
          {formatDate(selectedSlot.end_time, "HH:mm")}
        </p>
        <p className="text-sm text-[#666666] mt-1">
          担当：{selectedSlot.staff_name}
        </p>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* お名前 */}
        <div>
          <Label htmlFor="client_name">
            お名前 <span className="text-[#FF7676]">*</span>
          </Label>
          <Input
            id="client_name"
            type="text"
            value={formData.client_name}
            onChange={(e) => handleChange("client_name", e.target.value)}
            placeholder="山田 太郎"
            className={errors.client_name ? "border-[#FF7676]" : ""}
          />
          {errors.client_name && (
            <p className="mt-1 text-sm text-[#FF7676]">{errors.client_name}</p>
          )}
        </div>

        {/* メールアドレス */}
        <div>
          <Label htmlFor="client_email">
            メールアドレス <span className="text-[#FF7676]">*</span>
          </Label>
          <Input
            id="client_email"
            type="email"
            value={formData.client_email}
            onChange={(e) => handleChange("client_email", e.target.value)}
            placeholder="yamada@example.com"
            className={errors.client_email ? "border-[#FF7676]" : ""}
          />
          {errors.client_email && (
            <p className="mt-1 text-sm text-[#FF7676]">{errors.client_email}</p>
          )}
        </div>

        {/* お問い合わせ元 */}
        <div>
          <Label htmlFor="inquiry_source_id">
            お問い合わせ元 <span className="text-[#FF7676]">*</span>
          </Label>
          <Select
            value={formData.inquiry_source_id}
            onValueChange={(value) => handleChange("inquiry_source_id", value)}
          >
            <SelectTrigger className={errors.inquiry_source_id ? "border-[#FF7676]" : ""}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {inquirySources.map((source) => (
                <SelectItem key={source.id} value={source.id}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.inquiry_source_id && (
            <p className="mt-1 text-sm text-[#FF7676]">
              {errors.inquiry_source_id}
            </p>
          )}
        </div>

        {/* 会社名（任意） */}
        <div>
          <Label htmlFor="client_company">会社名（任意）</Label>
          <Input
            id="client_company"
            type="text"
            value={formData.client_company}
            onChange={(e) => handleChange("client_company", e.target.value)}
            placeholder="株式会社〇〇"
            className={errors.client_company ? "border-[#FF7676]" : ""}
          />
          {errors.client_company && (
            <p className="mt-1 text-sm text-[#FF7676]">
              {errors.client_company}
            </p>
          )}
        </div>

        {/* メモ（任意） */}
        <div>
          <Label htmlFor="client_memo">メモ（任意）</Label>
          <Textarea
            id="client_memo"
            value={formData.client_memo}
            onChange={(e) => handleChange("client_memo", e.target.value)}
            placeholder="ご質問やご要望などがあればご記入ください"
            className={errors.client_memo ? "border-[#FF7676]" : ""}
          />
          {errors.client_memo && (
            <p className="mt-1 text-sm text-[#FF7676]">{errors.client_memo}</p>
          )}
          <p className="mt-1 text-sm text-[#666666]">
            {formData.client_memo.length}/500文字
          </p>
        </div>

        {/* リマインダー設定 */}
        <div className="space-y-3 p-4 bg-[#FFF8E1] rounded-lg border border-[#FFC870]/30">
          <div>
            <Label className="text-base font-medium text-[#2D2D2D]">
              📧 リマインドメール設定
            </Label>
            <p className="mt-1 text-sm text-[#666666]">
              予約日時前にリマインドメールをお送りします
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="reminder_24h"
                checked={formData.reminder_24h_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, reminder_24h_enabled: !!checked }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="reminder_24h"
                  className="text-sm font-medium text-[#2D2D2D] cursor-pointer"
                >
                  24時間前にリマインド
                </label>
                <p className="text-xs text-[#666666] mt-0.5">
                  予約日の前日に、予約内容とGoogle Meetリンクをお送りします
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="reminder_30m"
                checked={formData.reminder_30m_enabled}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, reminder_30m_enabled: !!checked }))
                }
              />
              <div className="flex-1">
                <label
                  htmlFor="reminder_30m"
                  className="text-sm font-medium text-[#2D2D2D] cursor-pointer"
                >
                  30分前にリマインド
                </label>
                <p className="text-xs text-[#666666] mt-0.5">
                  予約時刻の30分前に、最終リマインドをお送りします
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 事前アンケート */}
        <QuestionnaireForm
          questions={MOCK_QUESTIONS}
          answers={questionnaireAnswers}
          onChange={(questionId, answer) => {
            setQuestionnaireAnswers((prev) => ({
              ...prev,
              [questionId]: answer,
            }))
            // エラーをクリア
            if (errors[questionId]) {
              setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[questionId]
                return newErrors
              })
            }
          }}
          errors={errors}
        />

        {/* ボタン */}
        <div className="flex flex-col gap-3 sticky bottom-0 left-0 right-0 bg-white pt-4 pb-4 -mx-4 px-4 border-t-2 border-gray-100">
          <Button
            type="submit"
            variant="accent"
            className="w-full h-14 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>予約を確定しています...</span>
              </div>
            ) : (
              "この内容で予約を確定する"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full h-12"
            onClick={onBack}
            disabled={isSubmitting}
          >
            戻る
          </Button>
        </div>
      </form>
    </div>
  )
}
