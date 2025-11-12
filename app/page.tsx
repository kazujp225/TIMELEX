import Link from "next/link"
import { Calendar, Clock, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/src/components/ui/Button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-panel to-panel flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-text mb-3 tracking-tight">
              TIMREXPLUS
            </h1>
            <div className="w-20 h-1 bg-brand-600 mx-auto rounded-full"></div>
          </div>

          {/* Hero Copy */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text mb-4 leading-tight">
            オンライン面談予約を、もっと<span className="text-brand-600">スムーズ</span>に
          </h2>
          <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
            空き枠を選んで、その場で予約完了。Google Meet リンクが即座に発行されます。
          </p>

          {/* Primary CTA */}
          <div className="mb-10">
            <Link href="/book">
              <Button
                variant="primary"
                size="lg"
                icon={<Calendar className="w-5 h-5" aria-hidden="true" />}
                className="text-xl px-8 py-5 min-h-[56px] shadow-lg hover:shadow-xl transition-all"
              >
                面談を予約する
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" aria-hidden="true" />
              無料でご利用いただけます
            </p>
          </div>

          {/* Features - Inline */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {/* Feature 1 */}
            <div className="bg-panel border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-600 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-text mb-2">即時確定</h3>
              <p className="text-sm text-muted">
                空き枠を選ぶだけで予約完了
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-panel border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-success text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-text mb-2">自動発行</h3>
              <p className="text-sm text-muted">
                Meet リンク自動生成
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-panel border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-brand-400 text-white rounded-lg flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 className="text-base font-bold text-text mb-2">3ステップ</h3>
              <p className="text-sm text-muted">
                シンプルで迷わない操作
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-row justify-center items-center gap-6 pt-8 border-t border-border">
            <Link href="/staff" className="text-sm text-muted hover:text-brand-600 transition-colors font-medium">
              スタッフログイン
            </Link>
            <span className="text-border">|</span>
            <Link href="/admin" className="text-sm text-muted hover:text-brand-600 transition-colors font-medium">
              管理者ログイン
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  )
}
