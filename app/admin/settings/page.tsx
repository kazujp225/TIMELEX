"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface GlobalSettings {
  minimum_booking_hours: number
  maximum_booking_days: number
  recent_customer_days: number
  cancellation_deadline_hours: number
  data_retention_days: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GlobalSettings>({
    minimum_booking_hours: 2,
    maximum_booking_days: 60,
    recent_customer_days: 30,
    cancellation_deadline_hours: 2,
    data_retention_days: 180,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || settings)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (settings.minimum_booking_hours < 0 || settings.minimum_booking_hours > 48) {
      newErrors.minimum_booking_hours = "0〜48時間の範囲で指定してください"
    }

    if (settings.maximum_booking_days < 7 || settings.maximum_booking_days > 365) {
      newErrors.maximum_booking_days = "7〜365日の範囲で指定してください"
    }

    if (settings.recent_customer_days < 7 || settings.recent_customer_days > 90) {
      newErrors.recent_customer_days = "7〜90日の範囲で指定してください"
    }

    if (settings.cancellation_deadline_hours < 0 || settings.cancellation_deadline_hours > 48) {
      newErrors.cancellation_deadline_hours = "0〜48時間の範囲で指定してください"
    }

    if (settings.data_retention_days < 30 || settings.data_retention_days > 365) {
      newErrors.data_retention_days = "30〜365日の範囲で指定してください"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert("設定を保存しました")
      } else {
        const data = await response.json()
        setErrors({ submit: data.error || "設定の保存に失敗しました" })
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      setErrors({ submit: "設定の保存に失敗しました" })
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

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-4xl font-bold">システム設定</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          グローバル設定を変更します
        </p>
      </div>

      {/* Booking Settings */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">予約設定</CardTitle>
          <CardDescription>予約に関する基本設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="minimum_booking_hours" className="text-base font-semibold">
              最短予約猶予（時間）
            </Label>
            <Input
              id="minimum_booking_hours"
              type="number"
              value={settings.minimum_booking_hours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minimum_booking_hours: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              max="48"
              className={`h-14 text-base ${errors.minimum_booking_hours ? "border-destructive" : ""}`}
            />
            {errors.minimum_booking_hours && (
              <p className="text-sm text-destructive mt-1">
                {errors.minimum_booking_hours}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              予約開始時刻の何時間前まで予約可能か（デフォルト: 2時間）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximum_booking_days" className="text-base font-semibold">
              最長予約期間（日）
            </Label>
            <Input
              id="maximum_booking_days"
              type="number"
              value={settings.maximum_booking_days}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  maximum_booking_days: parseInt(e.target.value) || 0,
                })
              }
              min="7"
              max="365"
              className={`h-14 text-base ${errors.maximum_booking_days ? "border-destructive" : ""}`}
            />
            {errors.maximum_booking_days && (
              <p className="text-sm text-destructive mt-1">
                {errors.maximum_booking_days}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              何日先まで予約を受け付けるか（デフォルト: 60日）
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancellation_deadline_hours" className="text-base font-semibold">
              キャンセル期限（時間）
            </Label>
            <Input
              id="cancellation_deadline_hours"
              type="number"
              value={settings.cancellation_deadline_hours}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  cancellation_deadline_hours: parseInt(e.target.value) || 0,
                })
              }
              min="0"
              max="48"
              className={`h-14 text-base ${errors.cancellation_deadline_hours ? "border-destructive" : ""}`}
            />
            {errors.cancellation_deadline_hours && (
              <p className="text-sm text-destructive mt-1">
                {errors.cancellation_deadline_hours}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              予約開始時刻の何時間前までキャンセル可能か（デフォルト: 2時間）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Customer Settings */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">顧客設定</CardTitle>
          <CardDescription>顧客分類に関する設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="recent_customer_days" className="text-base font-semibold">
              継続顧客判定期間（日）
            </Label>
            <Input
              id="recent_customer_days"
              type="number"
              value={settings.recent_customer_days}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  recent_customer_days: parseInt(e.target.value) || 0,
                })
              }
              min="7"
              max="90"
              className={`h-14 text-base ${errors.recent_customer_days ? "border-destructive" : ""}`}
            />
            {errors.recent_customer_days && (
              <p className="text-sm text-destructive mt-1">
                {errors.recent_customer_days}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              この期間内に予約があれば継続顧客とみなす（デフォルト: 30日）
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Settings */}
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">データ管理</CardTitle>
          <CardDescription>データ保持に関する設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="data_retention_days" className="text-base font-semibold">
              データ保持期間（日）
            </Label>
            <Input
              id="data_retention_days"
              type="number"
              value={settings.data_retention_days}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  data_retention_days: parseInt(e.target.value) || 0,
                })
              }
              min="30"
              max="365"
              className={`h-14 text-base ${errors.data_retention_days ? "border-destructive" : ""}`}
            />
            {errors.data_retention_days && (
              <p className="text-sm text-destructive mt-1">
                {errors.data_retention_days}
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              予約データを保持する期間（デフォルト: 180日）
            </p>
          </div>
        </CardContent>
      </Card>

      {errors.submit && (
        <div className="p-3 bg-destructive/10 border border-destructive rounded">
          <p className="text-sm text-destructive">{errors.submit}</p>
        </div>
      )}

      <div className="flex gap-4 pt-4">
        <Button onClick={handleSave} disabled={saving} className="h-14 px-8 text-base font-semibold">
          {saving ? "保存中..." : "設定を保存"}
        </Button>
        <Button
          variant="outline"
          onClick={fetchSettings}
          disabled={saving}
          className="h-14 px-8 text-base font-semibold"
        >
          リセット
        </Button>
      </div>
    </div>
  )
}
