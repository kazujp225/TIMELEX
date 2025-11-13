import { redirect } from "next/navigation"

export default function HomePage() {
  // トップページにアクセスしたら管理者ログインにリダイレクト
  redirect("/admin/login")
}
