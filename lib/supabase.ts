import { createClient } from "@supabase/supabase-js"

// URL de Supabase
const SUPABASE_URL = "https://hiyotpejjfpwzhhghcar.supabase.co"

// Verificar que las claves de API estén definidas
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
if (!serviceKey) {
  throw new Error("Se requiere una clave de servicio de Supabase (SUPABASE_SERVICE_ROLE_KEY)")
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("La variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida")
}

// Cliente de Supabase para operaciones del servidor (con clave de servicio)
export const supabaseAdmin = createClient(SUPABASE_URL, serviceKey)

// Cliente de Supabase para el navegador (con clave anónima)
export const createClientComponentClient = () => {
  return createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Cliente de Supabase para uso general en el servidor
export const supabase = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
