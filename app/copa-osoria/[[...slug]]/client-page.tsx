"use client"

import dynamic from "next/dynamic"

const CopaOsoriaApp = dynamic(() => import("@/copa-osoria/CopaOsoriaApp"), {
  ssr: false,
})

export default function CopaOsoriaClientPage() {
  return <CopaOsoriaApp />
}
