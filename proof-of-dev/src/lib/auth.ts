import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import GitHubProvider, { type GithubProfile } from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email read:org public_repo"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }

      if (profile) {
        const gh = profile as GithubProfile
        token.githubId = (gh.id as unknown as string | number) ?? undefined
        token.githubLogin = gh.login ?? undefined
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = (token.accessToken as string | undefined) ?? undefined
      session.githubId = (token.githubId as string | number | undefined) as string | undefined
      session.githubLogin = (token.githubLogin as string | undefined) ?? undefined
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
}

export default NextAuth(authOptions)
