import { NextResponse } from "next/server"
import { landingSupabaseAdmin, type GithubStats, type ImpactStats } from "@/lib/supabase-landing"

// El sync corre una vez al día, así que media hora de caché en el edge sobra.
const CACHE_CONTROL = "public, s-maxage=1800, stale-while-revalidate=3600"

// Cuántos lenguajes se muestran como etiquetas en la landing.
const LANGUAGE_LIMIT = 6

export async function GET() {
  const client = landingSupabaseAdmin

  if (!client) {
    return NextResponse.json(
      { error: "Falta LANDING_SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    )
  }

  try {
    const [githubResult, impactResult] = await Promise.all([
      client
        .from("github_stats_snapshots")
        .select(
          "total_commits, authored_commits, total_pull_requests, total_branches, total_repos, recent_languages, captured_at",
        )
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      client
        .from("impact_snapshots")
        .select("app_users, client_platform_people, total_people, business_locations")
        .order("captured_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    if (githubResult.error) throw githubResult.error
    if (impactResult.error) throw impactResult.error

    const github = githubResult.data as GithubStats | null
    const impact = impactResult.data as ImpactStats | null

    // Los lenguajes vienen en bytes; para la landing solo importa el ranking.
    const languages = Object.entries(github?.recent_languages ?? {})
      .sort(([, a], [, b]) => b - a)
      .slice(0, LANGUAGE_LIMIT)
      .map(([name]) => name)

    return NextResponse.json(
      {
        commits: github?.total_commits ?? null,
        pullRequests: github?.total_pull_requests ?? null,
        branches: github?.total_branches ?? null,
        people: impact?.total_people ?? null,
        languages,
        updatedAt: github?.captured_at ?? null,
      },
      { headers: { "Cache-Control": CACHE_CONTROL } },
    )
  } catch (error) {
    console.error("❌ Error leyendo estadísticas de la landing:", error)
    return NextResponse.json(
      { error: "No se pudieron cargar las estadísticas" },
      { status: 500 },
    )
  }
}
