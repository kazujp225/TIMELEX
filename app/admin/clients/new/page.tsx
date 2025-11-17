"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function NewClientPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    email: "",
    company: "",
    description: "",
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true)

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: autoGenerateSlug ? generateSlug(name) : prev.slug,
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "クライアント名を入力してください"
    } else if (formData.name.length > 100) {
      newErrors.name = "クライアント名は100文字以内で入力してください"
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "スラッグを入力してください"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "スラッグは英小文字、数字、ハイフンのみ使用できます"
    } else if (formData.slug.length > 50) {
      newErrors.slug = "スラッグは50文字以内で入力してください"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "正しいメールアドレスを入力してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/clients")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "クライアントの作成に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to create client:", error)
      setErrors({ submit: "クライアントの作成に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-4xl font-bold">新規クライアント追加</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          専用予約URLを発行するクライアントを登録します
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">
                クライアント名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="例：Acme Corporation"
                className={`h-14 text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-base font-semibold">
                スラッグ（URL用） <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoGenerateSlug(false)
                    setFormData({ ...formData, slug: e.target.value })
                  }}
                  placeholder="例：acme-corp"
                  className={`h-14 text-base font-mono ${errors.slug ? "border-destructive" : ""}`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAutoGenerateSlug(true)
                    setFormData((prev) => ({
                      ...prev,
                      slug: generateSlug(prev.name),
                    }))
                  }}
                  className="h-14 px-4"
                >
                  自動生成
                </Button>
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive mt-2">{errors.slug}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                予約URL: https://yourapp.com/book/client/{formData.slug || "スラッグ"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-base font-semibold">
                会社名（任意）
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="例：Acme Corporation"
                className="h-14 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                メールアドレス（任意）
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
                className={`h-14 text-base ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-2">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-semibold">
                説明（任意）
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="クライアントの説明やメモ"
                className="min-h-[100px] text-base"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-5 w-5 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-base">
                アクティブ（予約URLを有効にする）
              </Label>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving} className="h-14 px-8 text-base font-semibold">
                {saving ? "作成中..." : "クライアントを作成"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="h-14 px-8 text-base font-semibold"
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
