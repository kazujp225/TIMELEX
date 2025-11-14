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
import type { Question } from "@/types"

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
    <div className="py-8 border-t border-b border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          事前アンケート
        </h3>
        <p className="text-sm text-gray-600">
          より良いサポートのため、事前に以下の質問にお答えください
        </p>
      </div>

      <div className="space-y-6">
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
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => (
              <label
                key={optionIndex}
                htmlFor={`${question.id}-${optionIndex}`}
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  value === option
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  id={`${question.id}-${optionIndex}`}
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                />
                <span className="text-base text-gray-900 font-medium flex-1">
                  {option}
                </span>
              </label>
            ))}
          </div>
        )

      case "checkbox":
        return (
          <div className="space-y-3">
            {question.options?.map((option, optionIndex) => {
              const isChecked = Array.isArray(value) && value.includes(option)
              return (
                <label
                  key={optionIndex}
                  htmlFor={`${question.id}-${optionIndex}`}
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isChecked
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                  }`}
                >
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
                    className="h-5 w-5 flex-shrink-0"
                  />
                  <span className="text-base text-gray-900 font-medium flex-1">
                    {option}
                  </span>
                </label>
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
      <Label htmlFor={question.id} className="text-base font-medium text-gray-900">
        Q{index + 1}. {question.question_text}
        {question.is_required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {question.help_text && (
        <p className="text-xs text-gray-500 mt-1 mb-2">{question.help_text}</p>
      )}
      <div className="mt-2">{renderInput()}</div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
