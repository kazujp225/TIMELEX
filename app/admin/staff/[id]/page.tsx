"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Staff } from "@/types"

export default function EditStaffPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    timezone: "Asia/Tokyo",
    is_active: true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchStaff()
  }, [params.id])

  const fetchStaff = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/staff/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff)
        setFormData({
          name: data.staff.name,
          email: data.staff.email,
          timezone: data.staff.timezone,
          is_active: data.staff.is_active,
        })
      } else {
        console.error("Failed to fetch staff")
        router.push("/admin/staff")
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error)
      router.push("/admin/staff")
    } finally {
      setLoading(false)
    }
  }

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
      setSaving(true)

      const response = await fetch(`/api/admin/staff/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/staff")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "スタッフの更新に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to update staff:", error)
      setErrors({ submit: "スタッフの更新に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("本当にこのスタッフを削除しますか？この操作は取り消せません。")) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/admin/staff/${params.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/staff")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "スタッフの削除に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to delete staff:", error)
      setErrors({ submit: "スタッフの削除に失敗しました" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!staff) {
    return null
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">スタッフを編集</h1>
        <p className="text-muted-foreground mt-2">
          {staff.name} の情報を編集します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">
                名前 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="山田 太郎"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
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
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="timezone">タイムゾーン</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Tokyo">日本標準時 (JST)</SelectItem>
                  <SelectItem value="America/New_York">東部標準時 (EST)</SelectItem>
                  <SelectItem value="America/Los_Angeles">太平洋標準時 (PST)</SelectItem>
                  <SelectItem value="Europe/London">グリニッジ標準時 (GMT)</SelectItem>
                  <SelectItem value="UTC">協定世界時 (UTC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                アクティブ（予約受付を有効にする）
              </Label>
            </div>

            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? "保存中..." : "変更を保存"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                キャンセル
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">危険な操作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            スタッフを削除すると、関連する予約履歴は保持されますが、新規予約は受け付けられなくなります。
          </p>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={saving}
          >
            スタッフを削除
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
