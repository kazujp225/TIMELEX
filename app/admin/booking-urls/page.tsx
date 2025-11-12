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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-4xl font-bold">予約URL一覧</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          各商材の予約URLをお客様に送信してください
        </p>
      </div>

      {/* 使い方ガイド */}
      <Card className="border-2 border-brand-600/20 bg-brand-50">
        <CardHeader>
          <CardTitle className="text-xl">📧 使い方</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-semibold text-text">URLをコピー</p>
              <p className="text-sm text-muted-foreground">
                下記の商材リストから、お客様に案内したい商材の「コピー」ボタンをクリック
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-semibold text-text">メールに貼り付け</p>
              <p className="text-sm text-muted-foreground">
                お客様へのメールにURLを貼り付けて送信
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-semibold text-text">お客様が予約</p>
              <p className="text-sm text-muted-foreground">
                お客様がURLをクリック → 日付・時間選択 → 予約完了
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 商材リスト */}
      <div className="space-y-4">
        {products.map((product) => {
          const url = `${baseUrl}/book/${product.id}`
          const isCopied = copiedId === product.id

          return (
            <Card key={product.id} className="border-2 hover:border-brand-600/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyToClipboard(product.id, url)}
                      variant={isCopied ? "default" : "secondary"}
                      size="sm"
                      icon={isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    >
                      {isCopied ? "コピー済み" : "コピー"}
                    </Button>
                    <Button
                      onClick={() => window.open(url, "_blank")}
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="w-4 h-4" />}
                    >
                      プレビュー
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 border border-gray-300">
                  <code className="text-sm text-gray-800 break-all">
                    {url}
                  </code>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* メールテンプレート例 */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">💡 メールテンプレート例</CardTitle>
          <CardDescription className="text-base">
            お客様へのメールに使えるテンプレートです
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-300 space-y-4">
            <p className="text-sm text-gray-800 leading-relaxed">
              お世話になっております。<br />
              <br />
              この度は〇〇にご興味をお持ちいただき、ありがとうございます。<br />
              <br />
              以下のリンクから、ご都合の良い日時をお選びいただき、オンライン面談のご予約をお願いいたします。<br />
              <br />
              <strong>▼ 予約はこちら</strong><br />
              <span className="text-brand-600">[ここに上記のURLを貼り付け]</span><br />
              <br />
              ご予約完了後、自動でGoogle Meetのリンクが発行されます。<br />
              当日はそちらのリンクからご参加ください。<br />
              <br />
              ご不明点がございましたら、お気軽にお問い合わせください。<br />
              <br />
              何卒よろしくお願いいたします。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
