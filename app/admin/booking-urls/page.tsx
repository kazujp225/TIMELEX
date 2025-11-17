"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/src/components/ui/Button"

export default function BookingUrlsPage() {
  const [copiedId, setCopiedId] = useState<number | null>(null)

  // 商材の定義（後でデータベースから取得）
  const products = [
    { id: 1, name: "商材1 - ベーシック相談", description: "初回相談向け" },
    { id: 2, name: "商材2 - プレミアム相談", description: "詳細相談向け" },
    { id: 3, name: "商材3 - エンタープライズ相談", description: "企業向け" },
    { id: 4, name: "商材4 - コンサルティング", description: "継続顧客向け" },
    { id: 5, name: "商材5 - サポート相談", description: "サポート専用" },
    { id: 6, name: "商材6 - カスタム相談", description: "特別対応" },
  ]

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  const copyToClipboard = (id: number, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl md:text-4xl font-bold">予約URL一覧</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-lg">
          各商材の予約URLをお客様に送信してください
        </p>
      </div>

      {/* 使い方ガイド - コンパクト版 */}
      <Card className="border border-brand-600/20 bg-brand-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-xl">使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex-shrink-0">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text">URLをコピー</p>
              <p className="text-xs text-muted-foreground">
                商材の「コピー」ボタンをクリック
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex-shrink-0">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text">メールに貼り付け</p>
              <p className="text-xs text-muted-foreground">
                お客様へのメールにURLを貼り付け
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex-shrink-0">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text">お客様が予約</p>
              <p className="text-xs text-muted-foreground">
                URLクリック → 日付選択 → 予約完了
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商材リスト - コンパクト版 */}
      <div className="space-y-3">
        {products.map((product) => {
          const url = `${baseUrl}/book/${product.id}`
          const isCopied = copiedId === product.id

          return (
            <Card key={product.id} className="border hover:border-brand-600/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base md:text-xl truncate">{product.name}</CardTitle>
                    <CardDescription className="text-xs md:text-sm mt-0.5">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      onClick={() => copyToClipboard(product.id, url)}
                      variant={isCopied ? "primary" : "secondary"}
                      size="sm"
                      icon={isCopied ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : <Copy className="w-3 h-3 md:w-4 md:h-4" />}
                      className="text-xs md:text-sm px-2 md:px-3"
                    >
                      <span className="hidden md:inline">{isCopied ? "コピー済み" : "コピー"}</span>
                      <span className="md:hidden">{isCopied ? "済" : ""}</span>
                    </Button>
                    <Button
                      onClick={() => window.open(url, "_blank")}
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="w-3 h-3 md:w-4 md:h-4" />}
                      className="text-xs md:text-sm px-2 md:px-3 hidden md:flex"
                    >
                      プレビュー
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-100 rounded-lg p-2 md:p-4 border border-gray-300">
                  <code className="text-xs md:text-sm text-gray-800 break-all">
                    {url}
                  </code>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

    </div>
  )
}
