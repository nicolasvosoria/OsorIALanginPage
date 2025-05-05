"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/supabase"

export function AuthTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const testConnection = async () => {
    setStatus("loading")
    setMessage("")

    try {
      // Crear cliente de Supabase para el navegador
      const supabase = createClientComponentClient()

      // Intentar obtener la sesión actual (no requiere estar autenticado)
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      setStatus("success")
      setMessage(`Conexión exitosa. ${data.session ? "Usuario autenticado" : "No hay sesión activa"}`)
    } catch (error) {
      setStatus("error")
      setMessage(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <Card className="bg-transparent backdrop-blur-2xl border-gray-500 text-white">
      <CardHeader>
        <CardTitle>Prueba de conexión con Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={testConnection}
          disabled={status === "loading"}
          className="w-full border-2 border-white text-black bg-white hover:bg-transparent hover:text-white transition-all duration-300"
        >
          {status === "loading" ? "Probando..." : "Probar conexión"}
        </Button>

        {message && (
          <div
            className={`p-4 rounded-md ${
              status === "success"
                ? "bg-green-500/20 text-green-300"
                : status === "error"
                  ? "bg-red-500/20 text-red-300"
                  : ""
            }`}
          >
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
