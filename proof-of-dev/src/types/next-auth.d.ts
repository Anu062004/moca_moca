import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    githubId?: string | number
    githubLogin?: string
    user: DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    githubId?: string | number
    githubLogin?: string
  }
}



