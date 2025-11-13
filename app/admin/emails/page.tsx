"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ExternalLink, Mail, CheckCircle, XCircle, Clock } from "lucide-react"

interface EmailLog {
  id: string
  email_type: string
  booking_id?: string
  to_email: string
  to_name?: string
  from_email: string
  subject: string
  is_sent: boolean
  sent_at?: string
  failed_at?: string
  resend_id?: string
  resend_status?: string
  resend_error?: string
  retry_count: number
  created_at: string
  booking?: {
    id: string
    client_name: string
    start_time: string
  }
}

export default function EmailLogsPage() {
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "sent" | "failed">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const logsPerPage = 20

  useEffect(() => {
    const authenticated = sessionStorage.getItem("admin_authenticated")
    if (authenticated === "true") {
      setIsAuthenticated(true)
      fetchEmailLogs()
    } else {
      window.location.href = "/admin/login"
    }
  }, [])

  useEffect(() => {
    filterLogs()
  }, [emailLogs, statusFilter])

  const fetchEmailLogs = async () => {
    try {
      setLoading(true)
      const { supabase } = await import("@/lib/supabase")

      const { data, error } = await supabase
        .from("email_logs")
        .select(`
          *,
          booking:bookings(id, client_name, start_time)
        `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Failed to fetch email logs:", error)
        return
      }

      setEmailLogs(data || [])
    } catch (error) {
      console.error("Failed to fetch email logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterLogs = () => {
    let filtered = emailLogs

    if (statusFilter === "sent") {
      filtered = filtered.filter((log) => log.is_sent)
    } else if (statusFilter === "failed") {
      filtered = filtered.filter((log) => !log.is_sent)
    }

    setFilteredLogs(filtered)
    setCurrentPage(1)
  }

  const getStatusBadge = (log: EmailLog) => {
    if (log.is_sent) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          送信成功
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20">
          <XCircle className="w-3 h-3 mr-1" />
          送信失敗
        </Badge>
      )
    }
  }

  const getEmailTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      booking_confirmation: "予約確認",
      booking_reminder: "予約リマインダー",
      booking_cancelled: "予約キャンセル",
      booking_updated: "予約変更",
    }
    return types[type] || type
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage)
  const startIndex = (currentPage - 1) * logsPerPage
  const endIndex = startIndex + logsPerPage
  const currentLogs = filteredLogs.slice(startIndex, endIndex)

  if (!isAuthenticated || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const sentCount = emailLogs.filter((log) => log.is_sent).length
  const failedCount = emailLogs.filter((log) => !log.is_sent).length

  return (
    <div className="space-y-4 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">送信メールログ</h1>
        <p className="text-muted-foreground mt-2 sm:mt-3 text-base sm:text-lg">
          システムから送信されたメールの履歴を確認できます
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-6 grid-cols-3">
        <Card className="border-2">
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-base font-semibold">総送信数</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl">
              {emailLogs.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">全期間</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20">
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-base font-semibold">送信成功</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl text-green-600">
              {sentCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {emailLogs.length > 0
                ? Math.round((sentCount / emailLogs.length) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20">
          <CardHeader className="pb-2 sm:pb-3">
            <CardDescription className="text-xs sm:text-base font-semibold">送信失敗</CardDescription>
            <CardTitle className="text-2xl sm:text-4xl text-red-600">
              {failedCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {failedCount > 0 ? "要確認" : "問題なし"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">フィルター</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className="h-9 sm:h-10 text-sm sm:text-base"
            >
              すべて ({emailLogs.length})
            </Button>
            <Button
              variant={statusFilter === "sent" ? "default" : "outline"}
              onClick={() => setStatusFilter("sent")}
              className="h-9 sm:h-10 text-sm sm:text-base"
            >
              送信成功 ({sentCount})
            </Button>
            <Button
              variant={statusFilter === "failed" ? "default" : "outline"}
              onClick={() => setStatusFilter("failed")}
              className="h-9 sm:h-10 text-sm sm:text-base"
            >
              送信失敗 ({failedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card className="border-2">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl">メール送信履歴</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {filteredLogs.length}件のメール
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLogs.length === 0 ? (
            <p className="text-center py-8 sm:py-12 text-muted-foreground text-base sm:text-lg">
              メールログがありません
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {currentLogs.map((log) => (
                <div
                  key={log.id}
                  className="border-2 rounded-lg p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-2 sm:space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-2">
                        <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-sm sm:text-base">
                              {getEmailTypeLabel(log.email_type)}
                            </span>
                            {getStatusBadge(log)}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {log.subject}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="pl-7 space-y-1 text-xs sm:text-sm">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="text-muted-foreground">
                            <span className="font-medium">宛先:</span> {log.to_name || log.to_email}
                          </span>
                          {log.booking && (
                            <span className="text-muted-foreground">
                              <span className="font-medium">予約:</span>{" "}
                              {log.booking.client_name}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {log.is_sent && log.sent_at
                              ? formatDate(new Date(log.sent_at), "YYYY/MM/DD HH:mm")
                              : log.failed_at
                              ? formatDate(new Date(log.failed_at), "YYYY/MM/DD HH:mm")
                              : formatDate(new Date(log.created_at), "YYYY/MM/DD HH:mm")}
                          </span>
                          {log.retry_count > 0 && (
                            <span className="text-amber-600">
                              リトライ: {log.retry_count}回
                            </span>
                          )}
                        </div>

                        {/* Resend Info */}
                        {log.resend_id && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`https://resend.com/emails/${log.resend_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-xs"
                            >
                              Resend: {log.resend_id.slice(0, 16)}...
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Error Message */}
                        {!log.is_sent && log.resend_error && (
                          <div className="text-red-600 bg-red-500/5 border border-red-500/20 rounded p-2 mt-2">
                            <span className="font-medium">エラー:</span> {log.resend_error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Booking Link */}
                    {log.booking && (
                      <a
                        href={`/admin/calendar?bookingId=${log.booking.id}`}
                        className="text-primary hover:underline text-sm flex items-center gap-1 flex-shrink-0"
                      >
                        予約を表示
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 sm:h-10"
              >
                前へ
              </Button>
              <span className="text-sm text-muted-foreground px-3">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-9 sm:h-10"
              >
                次へ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
