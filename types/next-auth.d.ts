import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      staffId?: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
    staffId?: string
  }

  interface JWT {
    staffId?: string
    accessToken?: string
    refreshToken?: string
  }
}
