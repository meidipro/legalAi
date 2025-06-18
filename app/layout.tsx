import type React from "react"
import type { Metadata } from "next"
import { Poppins, Noto_Sans_Bengali } from "next/font/google"
import { ThemeProvider } from "@/contexts/theme-context"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
})

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "700"],
  variable: "--font-noto-sans-bengali",
})

export const metadata: Metadata = {
  title: "AI Legal Assistant BD",
  description: "Your AI-Powered Bangladesh Legal Assistant",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Meta tags for OAuth */}
        <meta name="google-signin-client_id" content={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID} />

        {/* Preload OAuth scripts */}
        <link rel="preload" href="https://accounts.google.com/gsi/client" as="script" />
      </head>
      <body className={`${poppins.variable} ${notoSansBengali.variable} font-sans`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
