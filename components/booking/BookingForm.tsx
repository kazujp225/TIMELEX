"use client"

import { useState } from "react"
import { Field, Input, Textarea } from "@/src/components/ui/Field"
import { Checkbox } from "@/components/ui/checkbox"
import { validateEmail, formatDate, getWeekday } from "@/lib/utils"
import { QuestionnaireForm } from "@/components/booking/QuestionnaireForm"
import { QuestionType } from "@/types"
import type { ConsultationType, Question } from "@/types"

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
    <div className="min-h-screen h-auto relative bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 pb-[120px] relative z-[1]">
        {/* ヘッダー */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            予約情報の入力
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            お客様の情報をご入力ください
          </p>
        </div>

        {/* 選択した日時の表示 */}
        <div className="mb-8 pb-6 border-b-2 border-gray-100">
          <div className="text-sm text-gray-500 mb-2">ご予約日時</div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {formatDate(selectedSlot.start_time, "YYYY/MM/DD")}（{getWeekday(selectedSlot.start_time)}）
          </p>
          <p className="text-lg text-gray-700">
            {formatDate(selectedSlot.start_time, "HH:mm")}〜{formatDate(selectedSlot.end_time, "HH:mm")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            担当：{selectedSlot.staff_name}
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6 relative z-[1]">
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
              <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                確認中...
              </p>
            )}
            {isReturningCustomer && !isCheckingEmail && (
              <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-500">
                <p className="text-sm font-medium text-green-900">
                  いつもご利用ありがとうございます
                </p>
                <p className="text-xs text-green-700 mt-1">
                  前回のご利用から30日以内のご予約です
                </p>
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
          <div className="py-8 border-t border-b border-gray-200">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                リマインドメール
              </h3>
              <p className="text-sm text-gray-600">
                予約日時前にお知らせメールをお送りします
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="reminder_24h"
                  checked={formData.reminder_24h_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, reminder_24h_enabled: !!checked }))
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="reminder_24h"
                    className="text-sm font-medium text-gray-900 cursor-pointer block"
                  >
                    24時間前にリマインド
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
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
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="reminder_30m"
                    className="text-sm font-medium text-gray-900 cursor-pointer block"
                  >
                    30分前にリマインド
                  </label>
                  <p className="text-xs text-gray-600 mt-1">
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
          <div className="mt-12 mb-8 space-y-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
            >
              {isSubmitting ? "予約を確定しています..." : "この内容で予約を確定する"}
            </button>

            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium border-2 border-gray-300 rounded-lg transition-colors"
            >
              ← 時間選択に戻る
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
