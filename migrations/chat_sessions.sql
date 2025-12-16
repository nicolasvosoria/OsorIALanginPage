-- Crear tabla para sesiones de conversación
-- Esta tabla almacena información sobre cada sesión de chat
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY, -- El session_id generado en el frontend (ej: session_1765902408587_0nwhkla)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0, -- Contador de mensajes en la sesión
  last_message_at TIMESTAMP WITH TIME ZONE,
  whatsapp_sent BOOLEAN DEFAULT FALSE, -- Indica si se envió resumen por WhatsApp
  whatsapp_sent_at TIMESTAMP WITH TIME ZONE
);

-- Crear índices para mejorar las consultas
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_whatsapp_sent ON chat_sessions(whatsapp_sent);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message_at ON chat_sessions(last_message_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_chat_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_chat_sessions_updated_at_trigger
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_sessions_updated_at();

