"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/src/components/ui/Button"

interface BookingUrl {
  id: string
  consultation_type_id: string
  url_path: string
  is_active: boolean
  consultation_type: {
    id: string
    name: string
    description: string | null
  }
}

export default function BookingUrlsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [bookingUrls, setBookingUrls] = useState<BookingUrl[]>([])
  const [loading, setLoading] = useState(true)

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3003"

  useEffect(() => {
    fetchBookingUrls()
  }, [])

  const fetchBookingUrls = async () => {
    try {
      setLoading(true)
      const { supabase } = await import("@/lib/supabase")

      // consultation_types を取得（有効なもののみ）
      const { data: types, error: typeError } = await supabase
        .from("consultation_types")
        .select("id, name, description")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (typeError) {
        console.error("Failed to fetch consultation types:", typeError)
        setLoading(false)
        return
      }

      // 各商材に対して予約URLを作成（consultation_type.id をそのまま使用）
      const urlsData = (types || []).map((type) => ({
        id: type.id,
        consultation_type_id: type.id,
        url_path: type.id,
        is_active: true,
        consultation_type: type
      }))

      setBookingUrls(urlsData)
    } catch (error) {
      console.error("Failed to fetch booking URLs:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
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

      {/* 商材リスト - データベースから取得 */}
      <div className="space-y-3">
        {bookingUrls.length === 0 ? (
          <Card className="border">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                予約URLが登録されていません。商材を作成すると自動的に表示されます。
              </p>
            </CardContent>
          </Card>
        ) : (
          bookingUrls.map((bookingUrl) => {
            const url = `${baseUrl}/book/${bookingUrl.url_path}`
            const isCopied = copiedId === bookingUrl.id

            return (
              <Card key={bookingUrl.id} className="border hover:border-brand-600/50 transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base md:text-xl truncate">
                        {bookingUrl.consultation_type.name}
                      </CardTitle>
                      {bookingUrl.consultation_type.description && (
                        <CardDescription className="text-xs md:text-sm mt-0.5">
                          {bookingUrl.consultation_type.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        onClick={() => copyToClipboard(bookingUrl.id, url)}
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
          })
        )}
      </div>

    </div>
  )
}
