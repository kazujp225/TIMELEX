"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/Button"
import { Field, Input, Textarea } from "@/src/components/ui/Field"
import { Card, CardContent } from "@/src/components/ui/Card"
import { Checkbox } from "@/components/ui/checkbox"
import { validateEmail, formatDate, getWeekday } from "@/lib/utils"
import { QuestionnaireForm } from "@/components/booking/QuestionnaireForm"
import { QuestionType } from "@/types"
import type { ConsultationType, Question } from "@/types"
import { Check, Clock, Mail } from "lucide-react"

interface BookingFormProps {
  selectedSlot: {
    start_time: Date
    end_time: Date
    staff_id: string
    staff_name: string
    consultation_type_id?: string
  }
  consultationTypes: ConsultationType[]
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
]

export function BookingForm({
  selectedSlot,
  consultationTypes,
  onSubmit,
  onBack,
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
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
      // 簡易API（Supabase不要）を呼び出し
      const response = await fetch("/api/bookings/simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_name: formData.client_name,
          client_email: formData.client_email,
          client_company: formData.client_company,
          client_memo: formData.client_memo,
          start_time: selectedSlot.start_time.toISOString(),
          end_time: selectedSlot.end_time.toISOString(),
          duration_minutes: consultationTypes[0]?.duration_minutes || 30,
          staff_id: selectedSlot.staff_id,
          staff_name: selectedSlot.staff_name,
          consultation_type_id: selectedSlot.consultation_type_id || consultationTypes[0]?.display_order?.toString() || "1",
          consultation_type_name: consultationTypes[0]?.name || "相談",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "予約に失敗しました")
      }

      onSubmit(data.booking_id)
    } catch (error) {
      console.error("予約エラー:", error)
      alert("予約に失敗しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-panel overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 px-4">
        <div className="w-full sm:max-w-3xl mx-auto">
          {/* ステップインジケーター */}
          <div className="flex items-center justify-center mb-5">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  <Check className="w-4 h-4" aria-hidden="true" />
                </div>
                <span className="text-sm text-muted hidden sm:inline">日時選択</span>
              </div>
              <div className="w-8 h-0.5 bg-brand-600" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="text-sm font-bold text-text hidden sm:inline">情報入力</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-border text-muted flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm text-muted hidden sm:inline">確認</span>
              </div>
            </div>
          </div>

          {/* 選択した日時の表示 */}
          <Card className="mb-4">
            <CardContent className="space-y-1 py-3">
              <div className="flex items-center gap-2 text-muted text-sm font-medium">
                <Clock className="w-4 h-4" aria-hidden="true" />
                <span>予約日時</span>
              </div>
              <p className="text-base font-bold text-text">
                {formatDate(selectedSlot.start_time, "YYYY/MM/DD")}（{getWeekday(selectedSlot.start_time)}） {formatDate(selectedSlot.start_time, "HH:mm")}〜{formatDate(selectedSlot.end_time, "HH:mm")}
              </p>
              <p className="text-sm text-muted">
                担当：{selectedSlot.staff_name}
              </p>
            </CardContent>
          </Card>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                    <p className="text-sm font-bold text-text">いつもご利用ありがとうございます</p>
                    <p className="text-xs text-muted mt-0.5">
                      前回のご利用から30日以内のご予約です
                    </p>
                  </div>
                </div>
              )}
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
            <div className="flex flex-col gap-3 mt-8 pb-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="!py-4 !text-lg"
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
                className="!py-4 !text-lg"
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
