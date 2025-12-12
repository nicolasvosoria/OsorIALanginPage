# OsorIa Landing Page

Aplicación web moderna desarrollada con Next.js 15 para OsorIA.tech, una empresa colombiana especializada en soluciones de inteligencia artificial.

## 🚀 Características

- **Landing page interactiva** con animaciones y efectos visuales
- **Speed Dial** - Botón flotante con acceso rápido a WhatsApp y Chatbot
- **Chatbot inteligente** con base de datos FAQ (60+ preguntas y respuestas)
- **Sistema de autenticación** (login/registro) con bcryptjs
- **Formulario de contacto** con validación
- **Panel de administración** para gestionar mensajes
- **Integración con Supabase** para base de datos y autenticación
- **Favicon dinámico** que cambia según el tema (claro/oscuro)
- **Diseño responsive** optimizado para todos los dispositivos
- **Animaciones fluidas** con Framer Motion

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **pnpm** (gestor de paquetes) - Si no lo tienes, instálalo con: `npm install -g pnpm`
- **Cuenta de Supabase** (para la base de datos)
- **Cuenta de XAI** (opcional, para el chat avanzado con Grok)

## 🔧 Instalación Local

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd OsorIALanginPage-main
```

### 2. Instalar dependencias

```bash
pnpm install
```

Si prefieres usar npm:
```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_de_supabase

# XAI/Grok Configuration (Opcional - para el chat avanzado)
XAI_API_KEY=tu_clave_de_xai

# Supabase URL alternativa (usado en algunas rutas)
SUPABASE_URL=tu_url_de_supabase
```

**Cómo obtener las credenciales de Supabase:**
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En tu proyecto, ve a Settings > API
3. Copia la `URL` y las claves `anon public` y `service_role`

### 4. Configurar la base de datos

Ejecuta las migraciones SQL en tu proyecto de Supabase:

1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Ejecuta los siguientes archivos SQL en orden:
   - `migrations/users.sql` - Crea la tabla de usuarios
   - `migrations/contact_messages.sql` - Crea la tabla de mensajes de contacto
   - `migrations/chat_conversations.sql` - Crea la tabla de conversaciones del chat

### 5. Ejecutar el proyecto en modo desarrollo

```bash
pnpm dev
```

O con npm:
```bash
npm run dev
```

El proyecto estará disponible en: `http://localhost:3000`

## 🏗️ Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción (después de build)
- `pnpm lint` - Ejecuta el linter

## 📁 Estructura del Proyecto

```
OsorIALanginPage-main/
├── actions/              # Server Actions (auth, contact)
├── app/                  # Páginas y rutas de Next.js
│   ├── api/             # API Routes
│   │   ├── chat-simple/ # Chatbot con FAQ (60+ preguntas)
│   │   ├── chat-grok/   # Chat avanzado con Grok/XAI (opcional)
│   │   ├── save-chat/   # Guardar conversaciones en Supabase
│   │   └── test-supabase/ # Pruebas de conexión
│   ├── admin/           # Panel de administración
│   ├── login/           # Página de login
│   ├── register/        # Página de registro
│   └── page.tsx         # Landing page principal
├── components/          # Componentes React
│   ├── speed-dial.tsx  # Botón flotante con WhatsApp y Chatbot
│   ├── chat-bot.tsx    # Componente del chatbot
│   ├── contact-form.tsx # Formulario de contacto
│   ├── Footer.tsx       # Footer con redes sociales
│   └── ui/            # Componentes de shadcn/ui
├── lib/                # Utilidades y configuraciones
│   ├── chatbot-logic.ts # Lógica reutilizable del chatbot (FAQ)
│   ├── supabase.ts     # Cliente de Supabase
│   └── utils.ts        # Utilidades generales
├── migrations/         # Scripts SQL para la base de datos
├── public/             # Archivos estáticos
│   └── images/         # Imágenes y favicons
└── types/              # Tipos TypeScript
```

## 🎯 Componentes Principales

### Speed Dial
Botón flotante ubicado en la esquina inferior derecha que permite acceso rápido a:
- **WhatsApp**: Abre WhatsApp Web con un mensaje prellenado
- **Chatbot**: Abre el chatbot integrado de la página

### Chatbot
Sistema de chatbot inteligente con:
- **Base de datos FAQ**: Más de 60 preguntas y respuestas predefinidas
- **Búsqueda por palabras clave**: Identifica la mejor respuesta según el mensaje
- **Almacenamiento de conversaciones**: Guarda todas las conversaciones en Supabase
- **Integración opcional con Grok/XAI**: Para respuestas más avanzadas

### Formulario de Contacto
Formulario validado que:
- Guarda los mensajes en Supabase
- Incluye validación de campos
- Muestra confirmación al enviar

## 🔍 Troubleshooting

### Error: "Falta la clave de servicio de Supabase"
- Verifica que el archivo `.env.local` existe y contiene `SUPABASE_SERVICE_ROLE_KEY`
- Asegúrate de que el archivo esté en la raíz del proyecto
- Reinicia el servidor de desarrollo después de agregar las variables

### Error: "relation contact_messages does not exist"
- Ejecuta el SQL para crear la tabla `contact_messages` (ver paso 4 de instalación)
- Verifica que las migraciones se ejecutaron correctamente en Supabase

### Error al instalar dependencias
- Asegúrate de tener Node.js 18+ instalado
- Intenta eliminar `node_modules` y `pnpm-lock.yaml` y reinstalar:
  ```bash
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### El chat bot no funciona
- Verifica que las variables de entorno de Supabase estén configuradas
- Asegúrate de que la tabla `chat_conversations` existe en Supabase
- Revisa la consola del navegador para ver errores específicos
- Verifica que el endpoint `/api/chat-simple` esté funcionando

### El Speed Dial no aparece
- Verifica que el componente `SpeedDial` esté importado en `app/page.tsx`
- Revisa la consola del navegador para errores de JavaScript
- Asegúrate de que Framer Motion esté instalado correctamente

## 🌐 Despliegue en Producción

Para desplegar en producción (Vercel, Netlify, etc.):

1. Construye el proyecto: `pnpm build`
2. Configura las variables de entorno en tu plataforma de hosting
3. Asegúrate de que las migraciones SQL estén ejecutadas en tu base de datos de producción
4. Configura el dominio y verifica que todas las rutas funcionen correctamente

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables de entorno en tu plataforma de hosting:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `XAI_API_KEY` (opcional)

## 📝 Notas Adicionales

- El proyecto usa **Next.js 15** con App Router
- **React 19** para la interfaz de usuario
- **TypeScript** para type safety
- La autenticación usa **bcryptjs** para hash de contraseñas
- El chat bot usa respuestas predefinidas basadas en palabras clave (60+ FAQ)
- Opcionalmente puede usar **Grok (XAI)** si está configurado
- Las imágenes están optimizadas con Next.js Image
- **Framer Motion** para animaciones fluidas
- **Tailwind CSS** y **shadcn/ui** para el diseño
- **Favicon dinámico** que cambia según el tema del sistema (claro/oscuro)

## 🎨 Tecnologías Utilizadas

- **Next.js 15** - Framework React
- **React 19** - Biblioteca de UI
- **TypeScript** - Lenguaje de programación
- **Supabase** - Backend como servicio (BaaS)
- **Framer Motion** - Animaciones
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **bcryptjs** - Hash de contraseñas
- **XAI/Grok** - IA para chat avanzado (opcional)
- **Lucide React** - Iconos

## 🤝 Contribuir

Si encuentras algún problema o tienes sugerencias, por favor abre un issue o crea un pull request.

## 📄 Licencia

Este proyecto es privado y pertenece a OsorIA.tech
