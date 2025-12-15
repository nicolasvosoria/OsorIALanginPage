# 📋 Instrucciones para Crear la Tabla `chat_conversations` en Supabase

## ⚠️ Error Actual
El error indica que la tabla `chat_conversations` no existe en tu base de datos de Supabase.

## ✅ Solución

### Paso 1: Acceder al SQL Editor de Supabase

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/yudejamenhxzipvdjrxq
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** (Nueva consulta)

### Paso 2: Ejecutar el Script SQL

**Opción A: Script Simple (Recomendado para empezar)**

Copia y pega el siguiente SQL en el editor:

```sql
-- Crear tabla para conversaciones del chat
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at);

-- Desactivar RLS temporalmente (para desarrollo)
ALTER TABLE public.chat_conversations DISABLE ROW LEVEL SECURITY;
```

**Opción B: Script Completo (con permisos configurados)**

Si prefieres usar el script completo con políticas de seguridad, usa el archivo `migrations/chat_conversations_completo.sql`

### Paso 3: Ejecutar el Script

1. Haz clic en el botón **"RUN"** (o presiona `Ctrl + Enter`)
2. Deberías ver un mensaje de éxito: `Success. No rows returned`

### Paso 4: Verificar que la Tabla se Creó

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver la tabla `chat_conversations` en la lista
3. Haz clic en ella para ver su estructura

## 📊 Estructura de la Tabla

La tabla `chat_conversations` tiene las siguientes columnas:

- **`id`**: UUID (identificador único, generado automáticamente)
- **`session_id`**: TEXT (ID de la sesión de chat)
- **`role`**: TEXT (puede ser 'user' o 'assistant')
- **`content`**: TEXT (contenido del mensaje)
- **`created_at`**: TIMESTAMP (fecha y hora de creación, generada automáticamente)

## 🔒 Permisos (RLS - Row Level Security)

Si necesitas que la aplicación pueda leer/escribir en esta tabla:

1. Ve a **"Authentication"** → **"Policies"**
2. Busca la tabla `chat_conversations`
3. Crea políticas si es necesario (para desarrollo, puedes desactivar RLS temporalmente)

### Desactivar RLS temporalmente (solo para desarrollo):

```sql
ALTER TABLE chat_conversations DISABLE ROW LEVEL SECURITY;
```

## ✅ Verificación

Después de crear la tabla, reinicia tu servidor local y prueba el chatbot. Los mensajes deberían guardarse correctamente en Supabase.

