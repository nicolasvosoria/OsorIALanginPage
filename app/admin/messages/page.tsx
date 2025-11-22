"use client"

import { useEffect, useState } from "react"
import { supabaseAdmin } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Background } from "@/components/background"
import { Preloader } from "@/components/preloader"

interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  idea: string
  created_at: string
  status: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabaseAdmin
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setMessages(data || [])
      } catch (err) {
        console.error("Error fetching messages:", err)
        setError("No se pudieron cargar los mensajes. Por favor, intenta de nuevo.")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])

  async function updateMessageStatus(id: string, status: string) {
    try {
      const { error } = await supabaseAdmin.from("contact_messages").update({ status }).eq("id", id)

      if (error) {
        throw error
      }

      // Actualizar el estado local
      setMessages(messages.map((message) => (message.id === id ? { ...message, status } : message)))
    } catch (err) {
      console.error("Error updating message status:", err)
      setError("No se pudo actualizar el estado del mensaje.")
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Preloader />
      <Background />
      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mensajes de Contacto</h1>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-md">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No hay mensajes para mostrar.</div>
          ) : (
            <div className="grid gap-6">
              {messages.map((message) => (
                <Card key={message.id} className="bg-black bg-opacity-50 backdrop-blur-md border-gray-700">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{message.name}</CardTitle>
                      <p className="text-sm text-gray-400">{message.email}</p>
                      {message.phone && <p className="text-sm text-gray-400">{message.phone}</p>}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm text-gray-400">{formatDate(message.created_at)}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full mt-1 ${
                          message.status === "nuevo"
                            ? "bg-blue-500 bg-opacity-20 text-blue-300"
                            : message.status === "en_proceso"
                              ? "bg-yellow-500 bg-opacity-20 text-yellow-300"
                              : "bg-green-500 bg-opacity-20 text-green-300"
                        }`}
                      >
                        {message.status === "nuevo"
                          ? "Nuevo"
                          : message.status === "en_proceso"
                            ? "En proceso"
                            : "Completado"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Idea/Proyecto:</h3>
                      <p className="text-white whitespace-pre-wrap">{message.idea}</p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`border-blue-500 text-blue-300 hover:bg-blue-500 hover:bg-opacity-10 ${
                          message.status === "nuevo" ? "bg-blue-500 bg-opacity-10" : ""
                        }`}
                        onClick={() => updateMessageStatus(message.id, "nuevo")}
                      >
                        Nuevo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:bg-opacity-10 ${
                          message.status === "en_proceso" ? "bg-yellow-500 bg-opacity-10" : ""
                        }`}
                        onClick={() => updateMessageStatus(message.id, "en_proceso")}
                      >
                        En proceso
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`border-green-500 text-green-300 hover:bg-green-500 hover:bg-opacity-10 ${
                          message.status === "completado" ? "bg-green-500 bg-opacity-10" : ""
                        }`}
                        onClick={() => updateMessageStatus(message.id, "completado")}
                      >
                        Completado
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
