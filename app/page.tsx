"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

interface ConsultationType {
  id: string
  name: string
  duration_minutes: number
}

export default function HomePage() {
  const [consultationTypes, setConsultationTypes] = useState<ConsultationType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: APIから相談種別を取得
    // 仮データ
    setConsultationTypes([
      {
        id: "1",
        name: "初回相談（AI導入）",
        duration_minutes: 30,
      },
      {
        id: "2",
        name: "定期相談",
        duration_minutes: 60,
      },
    ])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20">
        {/* ヘッダー */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            TIMREXPLUS
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            オンライン面談予約システム
          </p>
          <p className="text-base text-gray-500">
            ご希望の相談内容を選択して、予約を開始してください
          </p>
        </div>

        {/* 予約ボタン */}
        <div className="space-y-4 mb-16">
          {consultationTypes.map((type) => (
            <Link
              key={type.id}
              href={`/book?type=${type.id}`}
              className="block w-full py-6 px-8 bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {type.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    所要時間：{type.duration_minutes}分
                  </p>
                </div>
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* フッター */}
        <div className="text-center pt-8 border-t border-gray-200">
          <Link
            href="/admin/login"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            管理者ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
