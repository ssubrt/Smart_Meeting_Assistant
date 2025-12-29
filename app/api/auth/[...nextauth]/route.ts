import NextAuth, { NextAuthConfig } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.username || user.email,
            image: user.image,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                username: user.name || user.email.split('@')[0],
                image: user.image,
                googleId: account.providerAccountId,
              }
            })
          } else if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { 
                googleId: account.providerAccountId,
                username: existingUser.username || user.name || user.email.split('@')[0],
                image: user.image || existingUser.image
              }
            })
          }
        } catch (error) {
          console.error("Sign in error:", error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        
        if (user.email) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email }
            })
            
            if (dbUser) {
              token.username = dbUser.username
              token.image = dbUser.image
            }
          } catch (error) {
            console.error("JWT callback error:", error)
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.email = token.email as string
        session.user.image = token.image as string
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// --- FIXED CODE BELOW ---
const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

export const { GET, POST } = handlers