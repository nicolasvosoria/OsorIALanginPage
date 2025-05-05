"use server"

import { supabaseAdmin } from "@/lib/supabase"

export async function submitContactForm(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = (formData.get("phone") as string) || null
    const idea = formData.get("idea") as string

    // Validaciones básicas
    if (!name || !email || !idea) {
      return { success: false, error: "Por favor completa todos los campos requeridos." }
    }

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
      console.error("Error al guardar en Supabase:", error)
      return { success: false, error: "Error al guardar el mensaje. Por favor intenta de nuevo." }
    }

    // Devolvemos éxito
    return { success: true }
  } catch (error) {
    console.error("Error en submitContactForm:", error)
    return { success: false, error: "Ocurrió un error inesperado. Por favor intenta de nuevo." }
  }
}
