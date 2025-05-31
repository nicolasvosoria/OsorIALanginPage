import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Crear cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(req: Request) {
  try {
    const { sessionId, role, content } = await req.json()

    // Validar datos
    if (!sessionId || !role || !content) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Insertar mensaje en Supabase
    const { data, error } = await supabase.from("chat_conversations").insert([
      {
        session_id: sessionId,
        role,
        content,
      },
    ])

    if (error) {
      console.error("Error al guardar en Supabase:", error)
      return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error en la API de guardado:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
