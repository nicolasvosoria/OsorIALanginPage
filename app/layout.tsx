import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: "OsorIa",
  description: "OsorIA.tech - Soluciones de inteligencia artificial para empresas",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "/images/Favicone-negra.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/images/Favicone-blanca.png",
        media: "(prefers-color-scheme: light)",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable}`}>
      <body className="font-montserrat">{children}</body>
    </html>
  )
}
