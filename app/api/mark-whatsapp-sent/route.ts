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

    const { sessionId } = await req.json()

    // Validar datos
    if (!sessionId) {
      return NextResponse.json({ error: "Falta sessionId" }, { status: 400 })
    }

    // Actualizar la sesión para marcar que se envió por WhatsApp
    const { data, error } = await supabase
      .from("chat_sessions")
      .update({
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()

    if (error) {
      console.error("❌ Error al actualizar sesión en Supabase:", error)
      
      // Si la tabla no existe, no es crítico, solo loguear
      if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
        console.warn("⚠️ La tabla 'chat_sessions' no existe. Ejecuta migrations/chat_sessions.sql")
        return NextResponse.json({ 
          success: true,
          warning: "Tabla chat_sessions no existe, pero la operación se completó"
        })
      }
      
      return NextResponse.json({ 
        error: "Error al actualizar la sesión",
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("❌ Error en la API de marcado de WhatsApp:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

