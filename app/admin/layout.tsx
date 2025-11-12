"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // 開発モード: 認証チェックをスキップ（本番では有効化すること）
  const DEV_MODE = true

  useEffect(() => {
    if (!DEV_MODE && status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
    // TODO: Add admin role check
  }, [status, pathname, router])

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  if (!DEV_MODE && status === "loading") {
    return (
      <div className="min-h-screen-safe flex items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!DEV_MODE && status === "unauthenticated") {
    return null
  }

  return (
    <DashboardLayout role="admin" userEmail={session?.user?.email}>
      {children}
    </DashboardLayout>
  )
}
