import { createClient } from "@supabase/supabase-js"

// Proyecto Databases4OsorIA, schema "landingOsorIA".
// El schema lleva mayúsculas, así que el nombre va literal en la config.
const LANDING_SCHEMA = "landingOsorIA"

const LANDING_SUPABASE_URL =
  process.env.NEXT_PUBLIC_LANDING_SUPABASE_URL || "https://feqsjdhcsrksvrfsjsfv.supabase.co"

const anonKey = process.env.NEXT_PUBLIC_LANDING_SUPABASE_ANON_KEY
const serviceKey = process.env.LANDING_SUPABASE_SERVICE_ROLE_KEY

/**
 * Cliente de solo lectura para lo que es público (contador de GitHub, proyectos
 * publicados). Las políticas RLS ya limitan qué filas salen con esta llave.
 */
export const landingSupabase = anonKey
  ? createClient(LANDING_SUPABASE_URL, anonKey, { db: { schema: LANDING_SCHEMA } })
  : null

/**
 * Cliente de servidor. Nunca debe importarse desde un componente cliente.
 */
export const landingSupabaseAdmin = serviceKey
  ? createClient(LANDING_SUPABASE_URL, serviceKey, {
      db: { schema: LANDING_SCHEMA },
      auth: { persistSession: false },
    })
  : null

export interface GithubStats {
  /** Commits en las ramas por defecto de todos los repos. Es la cifra pública. */
  total_commits: number
  /** Commits atribuidos a la cuenta vía contributionsCollection. Menor. */
  authored_commits: number
  total_pull_requests: number
  total_branches: number
  total_repos: number
  /** Lenguajes de repos con push en los últimos 90 días. */
  recent_languages: Record<string, number>
  captured_at: string
}

export interface ImpactStats {
  /** Personas con cuenta en algo que construimos nosotros. */
  app_users: number
  /** Personas registradas en plataformas que operamos para clientes. */
  client_platform_people: number
  total_people: number
  business_locations: number
}
