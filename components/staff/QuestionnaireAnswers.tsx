"use client"

import type { Question, BookingAnswer } from "@/types"

interface QuestionnaireAnswersProps {
  questions: Question[]
  answers: BookingAnswer[]
}

export function QuestionnaireAnswers({ questions, answers }: QuestionnaireAnswersProps) {
  if (questions.length === 0 || answers.length === 0) {
    return null
  }

  // 回答をquestion_idでマッピング
  const answerMap = new Map(answers.map((a) => [a.question_id, a]))

  return (
    <div className="bg-white rounded-lg border p-6 space-y-4">
      <h2 className="text-lg font-semibold text-[#2D2D2D]">📋 事前アンケート回答</h2>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const answer = answerMap.get(question.id)

          if (!answer) {
            return null
          }

          return (
            <div
              key={question.id}
              className="pb-4 border-b last:border-b-0 last:pb-0"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xs font-medium text-[#999999] bg-gray-100 px-2 py-1 rounded">
                  Q{index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2D2D2D] mb-2">
                    {question.question_text}
                  </p>

                  {question.question_type === "checkbox" && answer.answer_json ? (
                    <ul className="list-disc list-inside text-sm text-[#666666] space-y-1">
                      {answer.answer_json.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : answer.answer_text ? (
                    <p className="text-sm text-[#666666] whitespace-pre-wrap">
                      {answer.answer_text}
                    </p>
                  ) : (
                    <p className="text-sm text-[#999999] italic">未回答</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
