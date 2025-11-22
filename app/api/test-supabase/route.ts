import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET() {
  try {
    // Intenta hacer una consulta simple a Supabase
    const { data, error } = await supabaseAdmin.from("users").select("count()").single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Conexión a Supabase exitosa",
      data,
    })
  } catch (error) {
    console.error("Error al conectar con Supabase:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error al conectar con Supabase",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
