# 🚀 Guía de Despliegue en Vercel

## Configuración de Variables de Entorno en Vercel

Para que el proyecto funcione correctamente en Vercel, debes configurar las siguientes variables de entorno:

### Pasos para Configurar Variables de Entorno en Vercel

1. **Accede a tu proyecto en Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Selecciona tu proyecto

2. **Ve a Settings > Environment Variables**

3. **Agrega las siguientes variables:**

#### Variables Requeridas de Supabase

```
NEXT_PUBLIC_SUPABASE_URL=https://yudejamenhxzipvdjrxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio_aqui
SUPABASE_URL=https://yudejamenhxzipvdjrxq.supabase.co
```

**Nota:** Reemplaza `tu_clave_anonima_aqui` y `tu_clave_de_servicio_aqui` con tus claves reales de Supabase.

#### Variables Opcionales

```
XAI_API_KEY=tu_clave_de_xai (solo si usas Grok/XAI)
```

### Cómo Obtener las Claves de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard/project/yudejamenhxzipvdjrxq
2. Ve a **Settings** (⚙️) > **API**
3. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (mantén esto secreto)

### Configuración por Ambiente

Puedes configurar variables diferentes para:
- **Production** (producción)
- **Preview** (preview/desarrollo)
- **Development** (desarrollo local)

### Después de Configurar las Variables

1. **Redeploy el proyecto** en Vercel
2. Verifica que el build se complete sin errores
3. Prueba las funcionalidades que requieren Supabase:
   - Formulario de contacto
   - Chatbot
   - Sistema de autenticación

### Solución de Problemas

#### Error: "supabaseUrl is required"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada
- Asegúrate de que el nombre de la variable sea exactamente como se muestra (case-sensitive)
- Redeploy después de agregar las variables

#### Error: "Error de configuración del servidor"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- Asegúrate de que las claves sean correctas y no hayan expirado

#### El build falla
- Verifica todas las variables de entorno están configuradas
- Revisa los logs de build en Vercel para ver errores específicos
- Asegúrate de que las tablas de Supabase estén creadas

### Variables de Entorno Mínimas Requeridas

Para que el proyecto funcione, estas son las variables **mínimas** requeridas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yudejamenhxzipvdjrxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://yudejamenhxzipvdjrxq.supabase.co
```

### Verificación

Después de configurar las variables y hacer redeploy, verifica:

1. ✅ El build se completa exitosamente
2. ✅ La página carga correctamente
3. ✅ El formulario de contacto funciona
4. ✅ El chatbot funciona
5. ✅ Los mensajes se guardan en Supabase

