"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatBotProps {
  isOpenExternal?: boolean
  onOpenChange?: (open: boolean) => void
  showFloatingButton?: boolean
}

export function ChatBot({ isOpenExternal, onOpenChange, showFloatingButton = true }: ChatBotProps) {
  const [isOpenInternal, setIsOpenInternal] = useState(false)
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : isOpenInternal
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open)
    } else {
      setIsOpenInternal(open)
    }
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "¡Hola! Soy el asistente de OsorIA.tech. ¿En qué puedo ayudarte hoy? Puedo responder preguntas sobre nuestros servicios de IA, desarrollo web, automatización y más.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState("")
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false)
  const [previousWasOpen, setPreviousWasOpen] = useState(false)

  // Generar un ID de sesión único al cargar el componente
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`)
  }, [])

  // Scroll al último mensaje
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Detectar cuando se cierra el chatbot y mostrar diálogo si hubo conversación
  useEffect(() => {
    if (previousWasOpen && !isOpen) {
      // Verificar si hubo una conversación real (más que solo el mensaje de bienvenida)
      const userMessages = messages.filter((msg) => msg.role === "user")
      if (userMessages.length > 0) {
        // Esperar un momento antes de mostrar el diálogo
        setTimeout(() => {
          setShowWhatsAppDialog(true)
        }, 500)
      }
    }
    setPreviousWasOpen(isOpen)
  }, [isOpen, previousWasOpen, messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Agregar mensaje del usuario
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
    }
    
    // Crear el nuevo array de mensajes incluyendo el mensaje actual
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Guardar mensaje del usuario en Supabase
      await saveMessageToSupabase(userMessage, sessionId)

      // Enviar mensaje a la API con historial de conversación
      // Filtrar el mensaje de bienvenida del historial para evitar confusión
      const messagesToSend = updatedMessages
        .filter((msg) => msg.id !== "welcome") // Excluir mensaje de bienvenida
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))

      const response = await fetch("/api/chat-simple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          messages: messagesToSend,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error en la respuesta del servidor")
      }

      const data = await response.json()

      // Validar que la respuesta tenga contenido
      if (!data.response || typeof data.response !== "string") {
        throw new Error("La respuesta del servidor no es válida")
      }

      // Agregar respuesta del asistente
      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: data.response.trim(),
      }
      setMessages((prev) => [...prev, assistantMessage])

      // Guardar respuesta del asistente en Supabase
      await saveMessageToSupabase(assistantMessage, sessionId)
    } catch (error) {
      console.error("❌ Error al enviar mensaje:", error)
      // Mensaje de error más específico
      const errorMessage = error instanceof Error 
        ? `Lo siento, ha ocurrido un error: ${error.message}. Por favor, intenta de nuevo.`
        : "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde."
      
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: "assistant",
          content: errorMessage,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Función para guardar mensajes en Supabase
  const saveMessageToSupabase = async (message: Message, sessionId: string) => {
    try {
      await fetch("/api/save-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          role: message.role,
          content: message.content,
        }),
      })
    } catch (error) {
      console.error("Error al guardar mensaje en Supabase:", error)
    }
  }

  // Función para generar resumen de la conversación
  const generateConversationSummary = (): string => {
    const userMessages = messages.filter((msg) => msg.role === "user")
    const assistantMessages = messages.filter((msg) => msg.role === "assistant")

    let summary = "📋 Resumen de conversación con OsorIA.tech\n\n"
    
    // Agregar preguntas del usuario
    if (userMessages.length > 0) {
      summary += "Preguntas realizadas:\n"
      userMessages.forEach((msg, index) => {
        summary += `${index + 1}. ${msg.content}\n`
      })
      summary += "\n"
    }

    // Agregar respuestas clave
    if (assistantMessages.length > 0) {
      summary += "Información proporcionada:\n"
      assistantMessages.slice(0, 3).forEach((msg, index) => {
        if (msg.id !== "welcome") {
          summary += `• ${msg.content.substring(0, 150)}${msg.content.length > 150 ? "..." : ""}\n\n`
        }
      })
    }

    summary += "\n💬 Para más información, contáctanos directamente por WhatsApp."
    
    return summary
  }

  // Función para enviar resumen por WhatsApp
  const handleSendToWhatsApp = () => {
    const summary = generateConversationSummary()
    const whatsappNumber = "573058661668" // Número de WhatsApp de OsorIA.tech
    const message = encodeURIComponent(summary)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
    
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
    setShowWhatsAppDialog(false)
  }

  return (
    <>
      {/* Floating Button - Solo se muestra si showFloatingButton es true */}
      {showFloatingButton && (
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-white text-black hover:bg-gray-100 shadow-lg border-2 border-gray-200 transition-all duration-300 hover:scale-110"
            size="lg"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
          </Button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96"
          >
            <Card className="bg-black/90 backdrop-blur-xl border-gray-600 text-white shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-gray-600">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Asistente OsorIA</h3>
                      <p className="text-xs text-gray-400">Asistente Virtual</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white hover:bg-gray-700 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.role === "user"
                          ? "bg-white text-black"
                          : "bg-gray-800 text-white border border-gray-600"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 text-white border border-gray-600 p-3 rounded-lg text-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-600">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-white"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading || !input.trim()}
                    className="bg-white text-black hover:bg-gray-100 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo para enviar resumen por WhatsApp */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="bg-black/95 border-gray-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              ¿Quieres recibir un resumen de la conversación?
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Podemos enviarte un resumen de tu conversación directamente por WhatsApp para que lo tengas a mano.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
            <Button
              onClick={handleSendToWhatsApp}
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 order-1"
            >
              <MessageCircle className="w-4 h-4 mr-2 text-white" />
              <span className="text-white">Enviar por WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWhatsAppDialog(false)}
              className="w-full sm:w-auto border-gray-500 bg-transparent text-white hover:bg-gray-800 hover:text-white hover:border-gray-400 transition-all duration-300 order-2"
            >
              <span className="text-white">No, gracias</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
