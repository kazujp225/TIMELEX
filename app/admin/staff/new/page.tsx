"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NewStaffPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    timezone: "Asia/Tokyo",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "名前を入力してください"
    } else if (formData.name.length > 50) {
      newErrors.name = "名前は50文字以内で入力してください"
    }

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください"
    } else if (formData.email.length > 100) {
      newErrors.email = "メールアドレスは100文字以内で入力してください"
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
      setLoading(true)

      // TODO: Call API to create staff
      const response = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/staff")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "スタッフの作成に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to create staff:", error)
      setErrors({ submit: "スタッフの作成に失敗しました" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold">スタッフを追加</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          新しいスタッフを登録します
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
                名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="山田 太郎"
                className={`h-14 text-base ${errors.name ? "border-destructive" : ""}`}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-2">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                メールアドレス <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="yamada@example.com"
                className={`h-14 text-base ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-2">{errors.email}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                このメールアドレスでGoogleログインします
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-base font-semibold">タイムゾーン</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger className="h-14 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full max-w-[calc(100vw-2rem)] max-h-[200px] overflow-y-auto">
                  <SelectItem value="Asia/Tokyo">日本標準時 (JST)</SelectItem>
                  <SelectItem value="America/New_York">東部標準時 (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">太平洋標準時 (PST)</SelectItem>
                  <SelectItem value="Europe/London">グリニッジ標準時 (GMT)</SelectItem>
                  <SelectItem value="UTC">協定世界時 (UTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="h-14 px-8 text-base font-semibold">
                {loading ? "作成中..." : "スタッフを追加"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
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
