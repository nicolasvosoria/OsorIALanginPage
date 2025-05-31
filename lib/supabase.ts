import { createClient } from "@supabase/supabase-js"

// URL de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hiyotpejjfpwzhhghcar.supabase.co"

// Verificar que las claves de API estén definidas
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!serviceKey) {
  console.error("❌ Falta la clave de servicio de Supabase")
}

if (!anonKey) {
  console.error("❌ Falta la clave anónima de Supabase")
}

// Cliente de Supabase para operaciones del servidor (con clave de servicio)
export const supabaseAdmin = serviceKey ? createClient(SUPABASE_URL, serviceKey) : null

// Cliente de Supabase para el navegador (con clave anónima)
export const createClientComponentClient = () => {
  if (!anonKey) {
    throw new Error("La variable de entorno NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida")
  }
  return createClient(SUPABASE_URL, anonKey)
}

// Cliente de Supabase para uso general en el servidor
export const supabase = anonKey ? createClient(SUPABASE_URL, anonKey) : null
