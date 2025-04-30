import type React from "react"
import { Manrope } from "next/font/google"
import { Preloader } from "@/components/preloader"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <Preloader />
        {children}
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
