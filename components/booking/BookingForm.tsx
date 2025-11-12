"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/Button"
import { Field, Input, Textarea } from "@/src/components/ui/Field"
import { Card, CardContent } from "@/src/components/ui/Card"
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
import { Check, Clock, Mail } from "lucide-react"

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
  const [isReturningCustomer, setIsReturningCustomer] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const checkReturningCustomer = async (email: string) => {
    if (!validateEmail(email)) {
      setIsReturningCustomer(false)
      return
    }

    setIsCheckingEmail(true)
    try {
      // TODO: APIリクエスト - 30日以内の予約履歴を確認
      await new Promise((resolve) => setTimeout(resolve, 500))

      // モック：50%の確率で継続顧客
      const isReturning = Math.random() > 0.5
      setIsReturningCustomer(isReturning)
    } catch (error) {
      console.error("Email check error:", error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // メールアドレスの場合は継続顧客チェック
    if (field === "client_email") {
      setIsReturningCustomer(false)
      if (value && validateEmail(value)) {
        checkReturningCustomer(value)
      }
    }

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
    <div className="min-h-screen-safe bg-panel py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  <Check className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-sm text-muted">日時選択</span>
              </div>
              <div className="w-8 h-0.5 bg-brand-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>
                  2
                </div>
                <span className="text-sm font-bold text-text">情報入力</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-border text-muted flex items-center justify-center text-sm font-medium" style={{ fontVariantNumeric: "tabular-nums" }}>
                  3
                </div>
                <span className="text-sm text-muted">確認</span>
              </div>
            </div>
          </div>

          {/* 選択した日時の表示 */}
          <Card className="mb-6">
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-muted text-sm font-medium">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>予約日時</span>
              </div>
              <p className="text-xl font-extrabold text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatDate(selectedSlot.start_time, "YYYY/MM/DD")}（
                {getWeekday(selectedSlot.start_time)}）
              </p>
              <p className="text-lg font-bold text-text" style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatDate(selectedSlot.start_time, "HH:mm")}〜
                {formatDate(selectedSlot.end_time, "HH:mm")}
              </p>
              <p className="text-sm text-muted">
                担当：{selectedSlot.staff_name}
              </p>
            </CardContent>
          </Card>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* お名前 */}
            <Field
              label="お名前"
              required
              error={errors.client_name}
            >
              <Input
                id="client_name"
                type="text"
                value={formData.client_name}
                onChange={(e) => handleChange("client_name", e.target.value)}
                placeholder="山田 太郎"
                error={!!errors.client_name}
              />
            </Field>

            {/* メールアドレス */}
            <Field
              label="メールアドレス"
              required
              error={errors.client_email}
            >
              <Input
                id="client_email"
                type="email"
                value={formData.client_email}
                onChange={(e) => handleChange("client_email", e.target.value)}
                placeholder="yamada@example.com"
                error={!!errors.client_email}
              />
              {isCheckingEmail && (
                <p className="mt-2 text-sm text-muted flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  確認中...
                </p>
              )}
              {isReturningCustomer && !isCheckingEmail && (
                <div className="mt-2 p-3 bg-success/10 border border-success/30 rounded-lg flex items-start gap-2">
                  <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-bold text-text">継続顧客として認識されました</p>
                    <p className="text-xs text-muted mt-0.5">
                      以前にもご予約いただきありがとうございます
                    </p>
                  </div>
                </div>
              )}
            </Field>

            {/* お問い合わせ元 */}
            <Field
              label="お問い合わせ元"
              required
              error={errors.inquiry_source_id}
            >
              <Select
                value={formData.inquiry_source_id}
                onValueChange={(value) => handleChange("inquiry_source_id", value)}
              >
                <SelectTrigger className={errors.inquiry_source_id ? "border-danger" : ""}>
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
            </Field>

            {/* 会社名（任意） */}
            <Field
              label="会社名（任意）"
              error={errors.client_company}
            >
              <Input
                id="client_company"
                type="text"
                value={formData.client_company}
                onChange={(e) => handleChange("client_company", e.target.value)}
                placeholder="株式会社〇〇"
                error={!!errors.client_company}
              />
            </Field>

            {/* メモ（任意） */}
            <Field
              label="メモ（任意）"
              error={errors.client_memo}
              help={`${formData.client_memo.length}/500文字`}
            >
              <Textarea
                id="client_memo"
                value={formData.client_memo}
                onChange={(e) => handleChange("client_memo", e.target.value)}
                placeholder="ご質問やご要望などがあればご記入ください"
                error={!!errors.client_memo}
              />
            </Field>

            {/* リマインダー設定 */}
            <Card>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-brand-600" aria-hidden="true" />
                  <p className="text-base font-bold text-text">リマインドメール設定</p>
                </div>
                <p className="text-sm text-muted">
                  予約日時前にリマインドメールをお送りします
                </p>

                <div className="space-y-3">
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
                        className="text-sm font-bold text-text cursor-pointer"
                      >
                        24時間前にリマインド
                      </label>
                      <p className="text-xs text-muted mt-0.5">
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
                        className="text-sm font-bold text-text cursor-pointer"
                      >
                        30分前にリマインド
                      </label>
                      <p className="text-xs text-muted mt-0.5">
                        予約時刻の30分前に、最終リマインドをお送りします
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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
            <div className="flex flex-col gap-3 sticky bottom-0 left-0 right-0 bg-panel pt-6 pb-4 border-t border-border">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
              >
                {isSubmitting ? "予約を確定しています..." : "この内容で予約を確定する"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={onBack}
                disabled={isSubmitting}
              >
                戻る
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
