"use client"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

export default function StaffLayout({
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
    if (!DEV_MODE && status === "unauthenticated" && pathname !== "/staff/login") {
      router.push("/staff/login")
    }
  }, [status, pathname, router])

  if (pathname === "/staff/login") {
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
    <DashboardLayout role="staff" userEmail={session?.user?.email}>
      {children}
    </DashboardLayout>
  )
}
