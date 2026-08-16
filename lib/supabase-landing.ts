import { createClient } from "@supabase/supabase-js"

// Proyecto Databases4OsorIA, schema "landingOsorIA".
// El schema lleva mayúsculas, así que el nombre va literal en la config.
const LANDING_SCHEMA = "landingOsorIA"

const LANDING_SUPABASE_URL =
  process.env.NEXT_PUBLIC_LANDING_SUPABASE_URL || "https://feqsjdhcsrksvrfsjsfv.supabase.co"

const serviceKey = process.env.LANDING_SUPABASE_SERVICE_ROLE_KEY

/**
 * Único cliente, y es de servidor. Nunca debe importarse desde un componente
 * cliente ni exponerse con NEXT_PUBLIC_.
 *
 * Deliberadamente NO hay cliente con llave anónima. En este proyecto conviven
 * schemas con tablas sin RLS —`OsoIADataAnalisis.cliente` tiene 1.685 personas
 * con nombre, documento, teléfono y correo— y todos están expuestos en
 * PostgREST. Publicar la llave anónima en el navegador dejaría esos datos al
 * alcance de cualquiera que abra el código fuente de la landing.
 *
 * Por eso la página nunca habla con Supabase: pide los datos a /api/*, y esas
 * rutas devuelven solo los agregados públicos.
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
