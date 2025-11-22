"use client"

import { RegisterForm } from "@/components/register-form"
import { Background } from "@/components/background"
import { Footer } from "@/components/footer"
import { Preloader } from "@/components/preloader"

export default function СтраницаЗаРегистрация() {
  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <RegisterForm />
      </div>
      <Footer />
    </div>
  )
}
