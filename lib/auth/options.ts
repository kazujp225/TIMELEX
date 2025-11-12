import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { supabaseAdmin } from "@/lib/supabase/client"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "メールアドレス", type: "email", placeholder: "name@example.com" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // データベースでスタッフを確認
          const { data: staff } = await supabaseAdmin
            .from("staff")
            .select("*")
            .eq("email", credentials.email.toLowerCase())
            .eq("is_active", true)
            .single()

          if (staff) {
            // 本番環境では、ここでパスワードハッシュを検証すること
            // 開発モードでは任意のパスワードで許可
            return {
              id: staff.id,
              email: staff.email,
              name: staff.name,
            }
          }

          // 開発モード: データベースにスタッフが存在しなくても許可
          return {
            id: "dev-" + Date.now(),
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        } catch (error) {
          console.error("Auth error:", error)
          // エラーでも開発モードでは許可
          return {
            id: "dev-" + Date.now(),
            email: credentials.email,
            name: credentials.email.split("@")[0],
          }
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // 初回サインイン時
      if (user) {
        token.staffId = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // セッションにカスタム情報を追加
      if (session.user) {
        session.user.staffId = token.staffId as string
        session.staffId = token.staffId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
}
