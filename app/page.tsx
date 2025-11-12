import Link from "next/link"
import { Calendar, Clock, Zap, CheckCircle } from "lucide-react"
import { Button } from "@/src/components/ui/Button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-panel to-panel flex items-center justify-center overflow-hidden relative">
      <div className="w-full sm:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="text-center w-full sm:max-w-5xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-4 sm:mb-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-text mb-2 sm:mb-3 tracking-tight">
              TIMREXPLUS
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-brand-600 mx-auto rounded-full"></div>
          </div>

          {/* Hero Copy */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-text mb-3 sm:mb-4 leading-tight">
            オンライン面談予約を、もっと<span className="text-brand-600">スムーズ</span>に
          </h2>
          <p className="text-base sm:text-lg text-muted mb-6 sm:mb-8 max-w-2xl mx-auto">
            空き枠を選んで、その場で予約完了。Google Meet リンクが即座に発行されます。
          </p>

          {/* Primary CTA - メールからの直接リンクを想定しているため、ここでは表示しない */}
          <div className="mb-6 sm:mb-10">
            <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto">
              ご予約は、お送りしたメールのリンクからお願いいたします
            </p>
          </div>

          {/* Features - Inline */}
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-6 sm:mb-10">
            {/* Feature 1 */}
            <div className="bg-panel border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-brand-600 text-white rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Zap className="w-5 sm:w-6 h-5 sm:h-6" aria-hidden="true" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text mb-1 sm:mb-2">即時確定</h3>
              <p className="text-xs sm:text-sm text-muted">
                空き枠を選ぶだけで予約完了
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-panel border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-success text-white rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Calendar className="w-5 sm:w-6 h-5 sm:h-6" aria-hidden="true" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text mb-1 sm:mb-2">自動発行</h3>
              <p className="text-xs sm:text-sm text-muted">
                Meet リンク自動生成
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-panel border border-border rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 sm:w-12 h-10 sm:h-12 bg-brand-400 text-white rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Clock className="w-5 sm:w-6 h-5 sm:h-6" aria-hidden="true" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-text mb-1 sm:mb-2">3ステップ</h3>
              <p className="text-xs sm:text-sm text-muted">
                シンプルで迷わない操作
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-600/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  )
}
