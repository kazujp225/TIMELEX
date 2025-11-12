"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"

interface ReportData {
  period: string
  totalBookings: number
  confirmedBookings: number
  cancelledBookings: number
  newCustomers: number
  returningCustomers: number
  inquirySourceBreakdown: Array<{ name: string; count: number }>
  consultationTypeBreakdown: Array<{ name: string; count: number }>
  staffBreakdown: Array<{ name: string; count: number }>
  utmSourceBreakdown: Array<{ source: string; count: number }>
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [period, setPeriod] = useState<"week" | "month" | "quarter" | "year">("month")

  useEffect(() => {
    fetchReport()
  }, [period])

  const fetchReport = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/admin/reports?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data.report)
      }
    } catch (error) {
      console.error("Failed to fetch report:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/reports/export?period=${period}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `report-${period}-${formatDate(new Date(), "YYYYMMDD")}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to export CSV:", error)
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">レポート・分析</h1>
          <p className="text-muted-foreground mt-2">
            予約データの分析とレポート生成
          </p>
        </div>

        <div className="flex gap-3">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">週次</SelectItem>
              <SelectItem value="month">月次</SelectItem>
              <SelectItem value="quarter">四半期</SelectItem>
              <SelectItem value="year">年次</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={exportCSV}>CSVエクスポート</Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>総予約数</CardDescription>
            <CardTitle className="text-3xl">
              {reportData?.totalBookings || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{period}期間</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>確定</CardDescription>
            <CardTitle className="text-3xl text-success">
              {reportData?.confirmedBookings || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {reportData?.totalBookings
                ? Math.round(
                    (reportData.confirmedBookings / reportData.totalBookings) * 100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>キャンセル</CardDescription>
            <CardTitle className="text-3xl text-destructive">
              {reportData?.cancelledBookings || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {reportData?.totalBookings
                ? Math.round(
                    (reportData.cancelledBookings / reportData.totalBookings) * 100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>新規顧客</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {reportData?.newCustomers || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {reportData?.totalBookings
                ? Math.round(
                    (reportData.newCustomers / reportData.totalBookings) * 100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>継続顧客</CardDescription>
            <CardTitle className="text-3xl text-accent">
              {reportData?.returningCustomers || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {reportData?.totalBookings
                ? Math.round(
                    (reportData.returningCustomers / reportData.totalBookings) * 100
                  )
                : 0}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Inquiry Source Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>お問い合わせ元別</CardTitle>
          <CardDescription>流入経路の内訳</CardDescription>
        </CardHeader>
        <CardContent>
          {!reportData?.inquirySourceBreakdown ||
          reportData.inquirySourceBreakdown.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              データがありません
            </p>
          ) : (
            <div className="space-y-3">
              {reportData.inquirySourceBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            reportData.totalBookings
                              ? (item.count / reportData.totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {item.count}件 (
                      {reportData.totalBookings
                        ? Math.round((item.count / reportData.totalBookings) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultation Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>相談種別別</CardTitle>
          <CardDescription>相談内容の内訳</CardDescription>
        </CardHeader>
        <CardContent>
          {!reportData?.consultationTypeBreakdown ||
          reportData.consultationTypeBreakdown.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              データがありません
            </p>
          ) : (
            <div className="space-y-3">
              {reportData.consultationTypeBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{
                          width: `${
                            reportData.totalBookings
                              ? (item.count / reportData.totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {item.count}件 (
                      {reportData.totalBookings
                        ? Math.round((item.count / reportData.totalBookings) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>スタッフ別</CardTitle>
          <CardDescription>スタッフごとの予約数</CardDescription>
        </CardHeader>
        <CardContent>
          {!reportData?.staffBreakdown || reportData.staffBreakdown.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              データがありません
            </p>
          ) : (
            <div className="space-y-3">
              {reportData.staffBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-success h-2 rounded-full"
                        style={{
                          width: `${
                            reportData.totalBookings
                              ? (item.count / reportData.totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {item.count}件 (
                      {reportData.totalBookings
                        ? Math.round((item.count / reportData.totalBookings) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* UTM Source Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>UTMソース別</CardTitle>
          <CardDescription>マーケティング流入元の分析</CardDescription>
        </CardHeader>
        <CardContent>
          {!reportData?.utmSourceBreakdown ||
          reportData.utmSourceBreakdown.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              データがありません
            </p>
          ) : (
            <div className="space-y-3">
              {reportData.utmSourceBreakdown.map((item) => (
                <div key={item.source} className="flex items-center justify-between">
                  <span className="font-medium">{item.source || "(なし)"}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            reportData.totalBookings
                              ? (item.count / reportData.totalBookings) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">
                      {item.count}件 (
                      {reportData.totalBookings
                        ? Math.round((item.count / reportData.totalBookings) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
