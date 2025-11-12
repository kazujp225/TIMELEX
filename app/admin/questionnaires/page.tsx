"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Questionnaire, ConsultationType } from "@/types"

// モックデータ
const MOCK_CONSULTATION_TYPES: ConsultationType[] = [
  {
    id: "1",
    name: "初回相談",
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    mode: "immediate" as any,
    recent_mode_override: "keep" as any,
    display_order: 0,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
  {
    id: "2",
    name: "フォローアップ",
    duration_minutes: 60,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    mode: "immediate" as any,
    recent_mode_override: "keep" as any,
    display_order: 1,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
  },
]

const MOCK_QUESTIONNAIRES: (Questionnaire & {
  consultation_type?: { id: string; name: string } | null
  questions: any[]
})[] = [
  {
    id: "1",
    name: "一般相談用アンケート",
    description: "初回相談時に記入していただく基本情報",
    consultation_type_id: null,
    is_active: true,
    display_order: 0,
    created_at: new Date("2025-01-10"),
    updated_at: new Date("2025-01-10"),
    consultation_type: null,
    questions: [
      { id: "q1", question_text: "ご相談の目的を教えてください" },
      { id: "q2", question_text: "ご相談の緊急度はどの程度ですか？" },
      { id: "q3", question_text: "当社をどこでお知りになりましたか？" },
    ],
  },
  {
    id: "2",
    name: "初回相談専用アンケート",
    description: "初めてご利用いただく方向けの詳細アンケート",
    consultation_type_id: "1",
    is_active: true,
    display_order: 1,
    created_at: new Date("2025-01-11"),
    updated_at: new Date("2025-01-11"),
    consultation_type: { id: "1", name: "初回相談" },
    questions: [
      { id: "q4", question_text: "事業内容を教えてください" },
      { id: "q5", question_text: "現在の課題は何ですか？" },
    ],
  },
  {
    id: "3",
    name: "フォローアップ用アンケート",
    description: "継続的なご相談の方向けのアンケート",
    consultation_type_id: "2",
    is_active: false,
    display_order: 2,
    created_at: new Date("2025-01-12"),
    updated_at: new Date("2025-01-12"),
    consultation_type: { id: "2", name: "フォローアップ" },
    questions: [{ id: "q6", question_text: "前回の相談後の進捗状況を教えてください" }],
  },
]

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState(MOCK_QUESTIONNAIRES)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  // 初回ロードのシミュレーション
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const filteredQuestionnaires = questionnaires.filter((q) => {
    // 検索フィルタ
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !q.name.toLowerCase().includes(query) &&
        !q.description?.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // ステータスフィルタ
    if (statusFilter === "active" && !q.is_active) return false
    if (statusFilter === "inactive" && q.is_active) return false

    // 相談種別フィルタ
    if (typeFilter !== "all") {
      if (typeFilter === "null") {
        if (q.consultation_type_id !== null) return false
      } else {
        if (q.consultation_type_id !== typeFilter) return false
      }
    }

    return true
  })

  const handleToggleActive = (id: string) => {
    const questionnaire = questionnaires.find((q) => q.id === id)
    if (!questionnaire) return

    setQuestionnaires((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_active: !q.is_active } : q))
    )

    toast.success(
      questionnaire.is_active
        ? `「${questionnaire.name}」を無効化しました`
        : `「${questionnaire.name}」を有効化しました`
    )
  }

  const handleDelete = (id: string) => {
    const questionnaire = questionnaires.find((q) => q.id === id)
    if (!questionnaire) return

    toast(
      <div>
        <p className="font-medium">アンケートを削除しますか？</p>
        <p className="text-sm text-[#666666] mt-1">「{questionnaire.name}」を削除します</p>
      </div>,
      {
        action: {
          label: "削除",
          onClick: () => {
            setQuestionnaires((prev) => prev.filter((q) => q.id !== id))
            toast.success(`「${questionnaire.name}」を削除しました`)
          },
        },
        cancel: {
          label: "キャンセル",
          onClick: () => {},
        },
      }
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8 animate-in fade-in duration-500">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#2D2D2D]">アンケート管理</h1>
          <p className="text-base sm:text-lg text-[#666666] mt-2 sm:mt-3">
            事前アンケートの作成・編集・管理
          </p>
        </div>
        <Link href="/admin/questionnaires/new">
          <Button className="gap-2 transition-all duration-200 hover:scale-105 hover:shadow-md h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto">
            <Plus className="h-4 sm:h-5 w-4 sm:w-5" />
            新規作成
          </Button>
        </Link>
      </div>

      {/* フィルタ・検索 */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-[#999999] transition-colors" />
          <Input
            placeholder="アンケート名・説明で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 sm:pl-12 h-12 sm:h-14 text-sm sm:text-base transition-all duration-200 focus:ring-2 focus:ring-[#6EC5FF]/20"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-12 sm:h-14 text-sm sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="all">全てのステータス</SelectItem>
            <SelectItem value="active">有効のみ</SelectItem>
            <SelectItem value="inactive">無効のみ</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-56 h-12 sm:h-14 text-sm sm:text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="all">全ての種別</SelectItem>
            <SelectItem value="null">全種別共通</SelectItem>
            {MOCK_CONSULTATION_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* アンケート一覧 */}
      <div className="bg-white rounded-lg border-2">
        {isLoading ? (
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-5 w-12" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-md" />
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-3 rounded-full" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredQuestionnaires.length === 0 ? (
          <div className="py-12 sm:py-20 px-4 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center justify-center w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-gray-100 mb-4 sm:mb-6">
              <Search className="h-8 sm:h-10 w-8 sm:w-10 text-[#999999]" />
            </div>
            <p className="text-[#999999] text-lg sm:text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "条件に一致するアンケートが見つかりません"
                : "アンケートがまだ作成されていません"}
            </p>
            <p className="text-sm sm:text-base text-[#CCCCCC] mb-6 sm:mb-8">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "検索条件を変更してお試しください"
                : "最初のアンケートを作成して、事前質問を設定しましょう"}
            </p>
            {!searchQuery && statusFilter === "all" && typeFilter === "all" && (
              <Link href="/admin/questionnaires/new">
                <Button
                  variant="outline"
                  className="transition-all duration-200 hover:scale-105 hover:shadow-md h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
                >
                  <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                  最初のアンケートを作成
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {filteredQuestionnaires.map((questionnaire, index) => (
              <div
                key={questionnaire.id}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#2D2D2D]">
                        {questionnaire.name}
                      </h3>
                      {questionnaire.is_active ? (
                        <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold bg-[#4CAF50]/10 text-[#4CAF50] rounded transition-all duration-200">
                          有効
                        </span>
                      ) : (
                        <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 text-gray-600 rounded transition-all duration-200">
                          無効
                        </span>
                      )}
                    </div>

                    {questionnaire.description && (
                      <p className="text-sm sm:text-base text-[#666666] mb-2 sm:mb-3">
                        {questionnaire.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-[#999999]">
                      <span>
                        📋 質問数: {questionnaire.questions.length}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        🎯 対象:{" "}
                        {questionnaire.consultation_type
                          ? questionnaire.consultation_type.name
                          : "全種別"}
                      </span>
                      <span className="hidden sm:inline">•</span>
                      <span>
                        作成日:{" "}
                        {new Date(questionnaire.created_at).toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      className="h-10 sm:h-12 w-10 sm:w-12 transition-all duration-200 hover:scale-110"
                      onClick={() => handleToggleActive(questionnaire.id)}
                      title={questionnaire.is_active ? "無効化" : "有効化"}
                    >
                      {questionnaire.is_active ? (
                        <ToggleRight className="h-4 sm:h-5 w-4 sm:w-5 text-[#4CAF50] transition-colors" />
                      ) : (
                        <ToggleLeft className="h-4 sm:h-5 w-4 sm:w-5 text-[#999999] transition-colors" />
                      )}
                    </Button>

                    <Link href={`/admin/questionnaires/${questionnaire.id}`}>
                      <Button
                        variant="ghost"
                        className="h-10 sm:h-12 w-10 sm:w-12 transition-all duration-200 hover:scale-110"
                        title="編集"
                      >
                        <Edit className="h-4 sm:h-5 w-4 sm:w-5 transition-colors" />
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      className="h-10 sm:h-12 w-10 sm:w-12 transition-all duration-200 hover:scale-110"
                      onClick={() => handleDelete(questionnaire.id)}
                      title="削除"
                    >
                      <Trash2 className="h-4 sm:h-5 w-4 sm:w-5 text-[#FF7676] transition-colors" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 件数表示 */}
      {filteredQuestionnaires.length > 0 && (
        <div className="text-sm sm:text-base text-[#999999] text-center font-medium">
          {filteredQuestionnaires.length}件のアンケート
          {(searchQuery || statusFilter !== "all" || typeFilter !== "all") &&
            ` (全${questionnaires.length}件中)`}
        </div>
      )}
    </div>
  )
}
