import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    // Obtener variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

    // Validar que las variables estén configuradas
    if (!supabaseUrl || !supabaseKey) {
      console.error("❌ Variables de entorno de Supabase no configuradas")
      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 }
      )
    }

    // Crear cliente de Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)

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
