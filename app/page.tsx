import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen-safe flex items-center justify-center bg-white">
      <div className="container-custom text-center py-12">
        <h1 className="text-5xl font-bold text-[#2D2D2D] mb-4">
          TIMREXPLUS
        </h1>
        <p className="text-xl text-[#666666] mb-12">
          オンライン面談予約システム
        </p>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* 予約ページ（クライアント向け） */}
          <Link
            href="/book"
            className="block p-8 bg-gradient-to-r from-[#6EC5FF] to-[#5AB3E8] text-white rounded-lg shadow-custom hover:opacity-90 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">📅 面談を予約する</h2>
                <p className="text-white/90">
                  空き枠を確認して、その場で予約確定
                </p>
              </div>
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* スタッフログイン */}
          <Link
            href="/staff/login"
            className="block p-6 bg-white border-2 border-[#6EC5FF] text-[#6EC5FF] rounded-lg hover:bg-[#6EC5FF]/5 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-bold mb-1">👤 スタッフログイン</h3>
                <p className="text-sm text-[#666666]">
                  予約管理・カレンダー確認
                </p>
              </div>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>

          {/* 管理者ログイン */}
          <Link
            href="/admin/login"
            className="block p-6 bg-white border-2 border-[#666666] text-[#666666] rounded-lg hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-lg font-bold mb-1">⚙️ 管理者ログイン</h3>
                <p className="text-sm text-[#999999]">
                  システム設定・スタッフ管理
                </p>
              </div>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>

        {/* フッター */}
        <div className="mt-16 text-sm text-[#999999]">
          <p>TimeRex/Calendly風のシームレスな予約体験</p>
          <p className="mt-2">開発中 - モックデータで動作確認可能</p>
        </div>
      </div>
    </div>
  )
}
