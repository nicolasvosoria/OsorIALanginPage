import { NextResponse } from "next/server"
import { landingSupabase, landingSupabaseAdmin } from "@/lib/supabase-landing"

// Lista curada; cambia poco. Una hora de caché en el edge sobra.
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400"

export async function GET() {
  const client = landingSupabase ?? landingSupabaseAdmin

  if (!client) {
    return NextResponse.json(
      { error: "Supabase de la landing no está configurado" },
      { status: 500 },
    )
  }

  try {
    const { data, error } = await client
      .from("showcase_projects")
      .select("name")
      .order("sort_order", { ascending: true })

    if (error) throw error

    return NextResponse.json(
      { projects: (data ?? []).map((row: { name: string }) => row.name) },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    )
  } catch (error) {
    console.error("❌ Error leyendo los proyectos:", error)
    return NextResponse.json({ error: "No se pudieron cargar los proyectos" }, { status: 500 })
  }
}
