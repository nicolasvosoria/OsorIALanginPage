"use server"

import { supabaseAdmin } from "@/lib/supabase"

export async function submitContactForm(formData: FormData) {
  try {
    // Verificar que el cliente de Supabase esté disponible
    if (!supabaseAdmin) {
      console.error("❌ Cliente de Supabase no configurado correctamente")
      return {
        success: false,
        error: "Error de configuración del servidor. Por favor contacta al administrador.",
      }
    }

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || null
    const idea = formData.get("idea") as string

    // Validaciones básicas
    if (!name || !email || !idea) {
      return { success: false, error: "Por favor completa todos los campos requeridos." }
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, error: "Por favor ingresa un email válido." }
    }

    console.log("📧 Intentando guardar mensaje de contacto:", { name, email, phone: phone || "N/A" })

    // Insertar datos en la tabla contact_messages de Supabase
    const { data, error } = await supabaseAdmin.from("contact_messages").insert([
      {
        name,
        email,
        phone,
        idea,
        status: "nuevo", // Estado inicial del mensaje
      },
    ])

    if (error) {
      console.error("❌ Error al guardar en Supabase:", error)

      // Manejar diferentes tipos de errores
      if (error.message.includes("Invalid API key")) {
        return {
          success: false,
          error: "Error de configuración del servidor. Por favor contacta al administrador.",
        }
      }

      if (error.message.includes("relation") && error.message.includes("does not exist")) {
        return {
          success: false,
          error: "Error de base de datos. Por favor contacta al administrador.",
        }
      }

      return {
        success: false,
        error: "Error al guardar el mensaje. Por favor intenta de nuevo.",
      }
    }

    console.log("✅ Mensaje guardado exitosamente:", data)

    // Devolvemos éxito
    return { success: true }
  } catch (error) {
    console.error("❌ Error en submitContactForm:", error)
    return {
      success: false,
      error: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
    }
  }
}
