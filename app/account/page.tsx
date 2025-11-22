"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Background } from "@/components/background"
import { useState, useEffect } from "react"
import { Footer } from "@/components/footer"
import { Preloader } from "@/components/preloader"

export default function AccountPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("userData")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUserData(parsedUser)
    } else {
      // Si no hay datos de usuario, redirigir al login
      router.push("/login")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("userData")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-transparent text-white overflow-hidden select-none">
      <Preloader />
      <Background />
      <div className="relative z-10">
        <div className="min-h-screen flex flex-col items-center justify-start p-4 pt-12">
          <div className="w-full max-w-2xl mb-12">
            <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
              <CardHeader>
                <CardTitle>Cuenta</CardTitle>
                <CardDescription className="text-gray-400">Administra la configuración de tu cuenta</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Email</h3>
                  <p className="text-gray-400">{userData?.email || "Cargando..."}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          <section className="w-full max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Panel de Usuario</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
                Bienvenido a tu panel de usuario. Aquí podrás gestionar tu cuenta y acceder a las funcionalidades de la
                plataforma.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
              <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
                <CardHeader>
                  <CardTitle>Mensajes de Contacto</CardTitle>
                  <CardDescription className="text-gray-400">
                    Accede a los mensajes enviados a través del formulario de contacto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push("/admin/messages")}
                    className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                  >
                    Ver mensajes
                  </Button>
                </CardContent>
              </Card>
              <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
                <CardHeader>
                  <CardTitle>Configuración</CardTitle>
                  <CardDescription className="text-gray-400">
                    Gestiona la configuración de tu cuenta y preferencias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => router.push("/account/settings")}
                    className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
                  >
                    Configuración
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
