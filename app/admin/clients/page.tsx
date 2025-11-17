"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Client {
  id: string
  name: string
  slug: string
  email: string | null
  company: string | null
  description: string | null
  is_active: boolean
  booking_url: string
  created_at: string
}

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (url: string, slug: string) => {
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">クライアント管理</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            クライアントごとの専用予約URLを管理
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/clients/new")}
          className="h-14 px-8 text-base font-semibold"
        >
          新規クライアント追加
        </Button>
      </div>

      <div className="grid gap-4 md:gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{client.name}</CardTitle>
                  {client.company && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {client.company}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                    className="h-10"
                  >
                    編集
                  </Button>
                  {!client.is_active && (
                    <span className="px-3 py-2 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                      無効
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {client.description && (
                <p className="text-sm text-gray-600">{client.description}</p>
              )}

              {client.email && (
                <div className="text-sm">
                  <span className="font-medium">メール: </span>
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                    {client.email}
                  </a>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">専用予約URL</p>
                    <p className="text-sm font-mono bg-white px-3 py-2 rounded border truncate">
                      {client.booking_url}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(client.booking_url, client.slug)}
                    className="h-10 flex-shrink-0"
                  >
                    {copiedSlug === client.slug ? "コピー済み!" : "URLをコピー"}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 text-xs text-gray-500">
                <span>スラッグ: {client.slug}</span>
                <span>作成日: {new Date(client.created_at).toLocaleDateString("ja-JP")}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-xl text-muted-foreground mb-4">
                まだクライアントが登録されていません
              </p>
              <Button
                onClick={() => router.push("/admin/clients/new")}
                className="h-12 px-6"
              >
                最初のクライアントを追加
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
