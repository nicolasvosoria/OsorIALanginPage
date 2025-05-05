"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitContactForm } from "@/actions/contact"
import { Loader2, CheckCircle } from "lucide-react"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      const result = await submitContactForm(formData)
      if (result.success) {
        setIsSuccess(true)
        // Reset form
        event.currentTarget.reset()
      } else {
        setError(result.error || "Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.")
      }
    } catch (err) {
      setError("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-black bg-opacity-50 backdrop-blur-lg p-6 rounded-lg border border-gray-700">
      {isSuccess ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">¡Mensaje enviado!</h3>
          <p className="text-gray-300 mb-4">Tu mensaje ha sido guardado en nuestra base de datos.</p>
          <p className="text-gray-300">Nos pondremos en contacto contigo pronto.</p>
          <Button className="mt-6 bg-white text-black hover:bg-gray-200" onClick={() => setIsSuccess(false)}>
            Enviar otro mensaje
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">
              Nombre
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Tu nombre"
              required
              className="bg-black bg-opacity-50 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-white">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
              className="bg-black bg-opacity-50 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-white">
              Teléfono (opcional)
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="Tu número de teléfono"
              className="bg-black bg-opacity-50 border-gray-700 text-white placeholder:text-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="idea" className="text-white">
              Tu idea
            </Label>
            <Textarea
              id="idea"
              name="idea"
              placeholder="Cuéntanos sobre tu idea o proyecto..."
              required
              className="bg-black bg-opacity-50 border-gray-700 text-white placeholder:text-gray-400 min-h-[120px]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm p-2 bg-red-500 bg-opacity-10 rounded border border-red-500">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black hover:bg-gray-200 transition-colors border-2 border-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar mensaje"
            )}
          </Button>
        </form>
      )}
    </div>
  )
}
