"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Staff } from "@/types"
import Link from "next/link"

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [staff, searchQuery, statusFilter])

  const fetchStaff = async () => {
    try {
      setLoading(true)

      // TODO: Create API endpoint to fetch all staff
      // For now, using placeholder data
      setStaff([])
    } catch (error) {
      console.error("Failed to fetch staff:", error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...staff]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((s) => s.is_active)
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((s) => !s.is_active)
    }

    setFilteredStaff(filtered)
  }

  const toggleStaffStatus = async (staffId: string, currentStatus: boolean) => {
    try {
      // TODO: Call API to toggle staff status
      console.log(`Toggling staff ${staffId} from ${currentStatus} to ${!currentStatus}`)

      // Refresh data
      await fetchStaff()
    } catch (error) {
      console.error("Failed to toggle staff status:", error)
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
          <h1 className="text-3xl font-bold">スタッフ管理</h1>
          <p className="text-muted-foreground mt-2">
            スタッフの追加・編集・削除を行います
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/staff/new">+ スタッフを追加</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>絞り込み</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">検索</label>
              <Input
                placeholder="名前またはメールアドレス"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">ステータス</label>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  全て
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => setStatusFilter("active")}
                  size="sm"
                >
                  アクティブ
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  onClick={() => setStatusFilter("inactive")}
                  size="sm"
                >
                  無効
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>スタッフ一覧（{filteredStaff.length}人）</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p>スタッフが見つかりません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.map((s) => (
                <div
                  key={s.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      {s.photo_url ? (
                        <img
                          src={s.photo_url}
                          alt={s.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {s.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{s.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              s.is_active
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {s.is_active ? "アクティブ" : "無効"}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{s.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          タイムゾーン: {s.timezone}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <Link href={`/admin/staff/${s.id}`}>編集</Link>
                      </Button>
                      <Button
                        variant={s.is_active ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleStaffStatus(s.id, s.is_active)}
                      >
                        {s.is_active ? "無効化" : "有効化"}
                      </Button>
                    </div>
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
