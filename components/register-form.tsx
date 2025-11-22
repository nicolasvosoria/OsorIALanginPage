"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { register } from "@/actions/auth"
import type { AuthFormData } from "@/types/auth"
import Link from "next/link"

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data: AuthFormData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    const result = await register(data)

    if (result.success) {
      // Store user data in localStorage
      localStorage.setItem("userData", JSON.stringify(result.userData))
      router.push("/account")
    } else {
      setError(result.message)
    }

    setIsLoading(false)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="w-full max-w-md mx-auto bg-transparent backdrop-blur-2xl border-gray-500 text-white">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">Crear una cuenta</CardTitle>
          <CardDescription className="text-gray-400">
            Introduce tu email y contraseña para crear tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder="Email"
                required
                className="bg-transparent border-gray-500 text-white placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="bg-transparent border-gray-500 text-white placeholder:text-gray-400"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Por favor, espera
                </>
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <div className="text-center text-sm text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-white hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
