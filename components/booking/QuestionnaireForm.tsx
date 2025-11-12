"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Question, QuestionType } from "@/types"

interface QuestionnaireFormProps {
  questions: Question[]
  answers: Record<string, string | string[]>
  onChange: (questionId: string, answer: string | string[]) => void
  errors: Record<string, string>
}

export function QuestionnaireForm({
  questions,
  answers,
  onChange,
  errors,
}: QuestionnaireFormProps) {
  if (questions.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold text-[#2D2D2D]">
          📋 事前アンケート
        </h2>
        <p className="text-sm text-[#666666] mt-1">
          より良いサポートのため、事前に以下の質問にお答えください
        </p>
      </div>

      {questions.map((question, index) => (
        <QuestionField
          key={question.id}
          question={question}
          index={index}
          value={answers[question.id]}
          onChange={(value) => onChange(question.id, value)}
          error={errors[question.id]}
        />
      ))}
    </div>
  )
}

function QuestionField({
  question,
  index,
  value,
  onChange,
  error,
}: {
  question: Question
  index: number
  value: string | string[] | undefined
  onChange: (value: string | string[]) => void
  error?: string
}) {
  const renderInput = () => {
    switch (question.question_type) {
      case "text":
        return (
          <Input
            id={question.id}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || ""}
            className={error ? "border-[#FF7676]" : ""}
          />
        )

      case "textarea":
        return (
          <Textarea
            id={question.id}
            value={(value as string) || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || ""}
            rows={4}
            className={error ? "border-[#FF7676]" : ""}
          />
        )

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${question.id}-${optionIndex}`}
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-4 w-4 text-[#6EC5FF] focus:ring-[#6EC5FF]"
                />
                <label
                  htmlFor={`${question.id}-${optionIndex}`}
                  className="text-sm text-[#2D2D2D] cursor-pointer"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => {
              const isChecked = Array.isArray(value) && value.includes(option)
              return (
                <div key={optionIndex} className="flex items-center gap-2">
                  <Checkbox
                    id={`${question.id}-${optionIndex}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const currentValues = (value as string[]) || []
                      if (checked) {
                        onChange([...currentValues, option])
                      } else {
                        onChange(currentValues.filter((v) => v !== option))
                      }
                    }}
                  />
                  <label
                    htmlFor={`${question.id}-${optionIndex}`}
                    className="text-sm text-[#2D2D2D] cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              )
            })}
          </div>
        )

      case "select":
        return (
          <Select
            value={(value as string) || ""}
            onValueChange={(val) => onChange(val)}
          >
            <SelectTrigger className={error ? "border-[#FF7676]" : ""}>
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, optionIndex) => (
                <SelectItem key={optionIndex} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <Label htmlFor={question.id} className="text-base">
        Q{index + 1}. {question.question_text}
        {question.is_required && <span className="text-[#FF7676] ml-1">*</span>}
      </Label>
      {question.help_text && (
        <p className="text-xs text-[#999999] mt-1 mb-2">{question.help_text}</p>
      )}
      <div className="mt-2">{renderInput()}</div>
      {error && <p className="mt-1 text-sm text-[#FF7676]">{error}</p>}
    </div>
  )
}
