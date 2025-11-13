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

interface GoogleCalendarStatus {
  isConnected: boolean
  email: string | null
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
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus>({
    isConnected: false,
    email: null,
  })

  useEffect(() => {
    fetchSettings()
    checkGoogleConnection()
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

  const checkGoogleConnection = () => {
    // 環境変数が設定されているかチェック
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET

    // 簡易チェック（実際にはAPIで確認すべき）
    const isConfigured = !!(clientId && clientId !== 'your-google-client-id.apps.googleusercontent.com')

    setGoogleStatus({
      isConnected: isConfigured,
      email: isConfigured ? 'contact@zettai.co.jp' : null,
    })
  }

  const handleGoogleConnect = () => {
    // Google OAuth認証フローを開始
    window.location.href = '/api/auth/signin/google'
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
    <div className="space-y-4 sm:space-y-8 ">
      <div>
        <h1 className="text-4xl font-bold">システム設定</h1>
        <p className="text-muted-foreground mt-3 text-lg">
          グローバル設定を変更します
        </p>
      </div>

      {/* 予約設定・顧客設定・データ管理 - 一旦非表示（将来復活予定） */}
      {/*
      <Card className="border-2">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">予約設定</CardTitle>
          <CardDescription>予約に関する基本設定</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          ...
        </CardContent>
      </Card>
      */}

      {/* Google Calendar Integration */}
      <Card className="border-2 border-brand-600">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">Google カレンダー連携（オプション）</CardTitle>
          <CardDescription>Google Meet URLを手動発行する場合は不要です</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {googleStatus.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-green-900">連携済み</p>
                  <p className="text-sm text-green-700">{googleStatus.email}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>✅ Google Calendar連携が有効です</strong><br />
                  将来的にGoogle Meet URLの自動発行やカレンダー同期を有効化できます。
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">未連携</p>
                  <p className="text-sm text-gray-600">現在は手動運用中（連携は任意です）</p>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>💡 Google Calendarと連携すると（将来機能）：</strong>
                </p>
                <ul className="text-sm text-gray-700 space-y-2 ml-4 list-disc">
                  <li>Google Meet URLの自動生成</li>
                  <li>カレンダーへの予定自動追加</li>
                  <li>予約者へのMeet URL自動送信</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  ※ 現在は予約ごとにMeet URLを手動で発行する運用です
                </p>
              </div>
              <Button
                onClick={handleGoogleConnect}
                variant="outline"
                className="h-14 px-8 text-base font-semibold w-full sm:w-auto"
              >
                Googleアカウントと連携（オプション）
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 保存ボタン - 一旦非表示（設定項目復活時に使用） */}
      {/*
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
      */}
    </div>
  )
}
