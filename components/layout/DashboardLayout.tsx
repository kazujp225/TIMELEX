"use client"

import { DarkSidebar } from "./DarkSidebar"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "staff" | "admin"
  userEmail?: string | null
}

export function DashboardLayout({ children, role, userEmail }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DarkSidebar role={role} userEmail={userEmail} />

      {/* Main Content Area */}
      <main className="lg:pl-64 pb-16 lg:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
