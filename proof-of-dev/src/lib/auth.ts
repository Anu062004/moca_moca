import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.githubId = profile.id
        token.githubLogin = profile.login
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.githubId = token.githubId as string
      session.githubLogin = token.githubLogin as string
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

export default NextAuth(authOptions)
