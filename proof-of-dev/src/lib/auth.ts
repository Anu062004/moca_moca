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
          scope: "read:user user:email read:org public_repo read:repo"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Store access token from OAuth account
      if (account?.access_token) {
        token.accessToken = account.access_token
        console.log('JWT: Access token stored for user:', token.sub)
      }

      // Store GitHub profile information
      if (profile) {
        const gh = profile as GithubProfile
        token.githubId = (gh.id as unknown as string | number) ?? undefined
        token.githubLogin = gh.login ?? undefined
        console.log('JWT: GitHub profile stored:', { 
          id: gh.id, 
          login: gh.login,
          name: gh.name 
        })
      }
      return token
    },
    async session({ session, token }) {
      // Pass access token to session
      session.accessToken = (token.accessToken as string | undefined) ?? undefined
      session.githubId = (token.githubId as string | number | undefined) as string | undefined
      session.githubLogin = (token.githubLogin as string | undefined) ?? undefined
      
      // Log session creation for debugging
      console.log('Session: Created for user:', {
        email: session.user?.email,
        githubLogin: session.githubLogin,
        hasAccessToken: !!session.accessToken
      })
      
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error: (code, metadata) => {
      console.error('NextAuth Error:', code, metadata)
    },
    warn: (code) => {
      console.warn('NextAuth Warning:', code)
    },
    debug: (code, metadata) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata)
      }
    }
  }
}

export default NextAuth(authOptions)