import type { Metadata } from "next"
import { Noto_Sans_JP, Inter } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { AuthSessionProvider } from "@/components/providers/session-provider"
import "./globals.css"

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "TIMREXPLUS - オンライン面談予約システム",
  description: "TimeRex/Calendlyのような直感的な予約体験を、社内運用に最適化したオンライン予約システム",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
  },
  themeColor: "#6EC5FF",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${inter.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // ビューポート高さの動的設定（iOS対応）
              function setVH() {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
              }
              setVH();
              window.addEventListener('resize', setVH);
              window.addEventListener('orientationchange', setVH);
            `,
          }}
        />
      </head>
      <body className={notoSansJP.className}>
        <AuthSessionProvider>
          {children}
          <Toaster />
        </AuthSessionProvider>
      </body>
    </html>
  )
}
