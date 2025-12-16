-- ============================================
-- Script completo para crear la tabla chat_conversations
-- ============================================

-- Crear tabla para conversaciones del chat
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON public.chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON public.chat_conversations(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir inserción desde el servicio (service_role)
-- Esta política permite que el servicio_role inserte datos
CREATE POLICY "Allow service role to insert chat conversations"
ON public.chat_conversations
FOR INSERT
TO service_role
WITH CHECK (true);

-- Crear política para permitir lectura desde el servicio
CREATE POLICY "Allow service role to read chat conversations"
ON public.chat_conversations
FOR SELECT
TO service_role
USING (true);

-- Si necesitas que usuarios anónimos también puedan insertar (opcional)
-- Descomenta las siguientes líneas:
-- CREATE POLICY "Allow anon to insert chat conversations"
-- ON public.chat_conversations
-- FOR INSERT
-- TO anon
-- WITH CHECK (true);

-- Verificar que la tabla se creó correctamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'chat_conversations'
ORDER BY ordinal_position;

