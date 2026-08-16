import { NextResponse } from "next/server"
import { landingSupabaseAdmin } from "@/lib/supabase-landing"

// Lista curada; cambia poco. Una hora de caché en el edge sobra.
const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400"

export async function GET() {
  const client = landingSupabaseAdmin

  if (!client) {
    return NextResponse.json(
      { error: "Falta LANDING_SUPABASE_SERVICE_ROLE_KEY" },
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
