# 🧪 Guía de Pruebas - OsorIA.tech

## ✅ Checklist de Pruebas del Sistema

### 1. Pruebas del Chatbot en la Página Web

#### A. Abrir el Chatbot
- [ ] Hacer clic en el botón blanco del Speed Dial (esquina inferior derecha)
- [ ] Verificar que se despliega el menú con WhatsApp y Chat
- [ ] Hacer clic en el botón de Chat
- [ ] Verificar que se abre la ventana del chatbot

#### B. Probar Respuestas del Chatbot
Prueba estas preguntas y verifica las respuestas:

1. **Pregunta sobre servicios:**
   - Escribe: "¿Qué servicios ofrecen?"
   - ✅ Debe responder sobre los servicios de IA

2. **Pregunta sobre precios:**
   - Escribe: "¿Cuánto cuesta?"
   - ✅ Debe responder sobre precios variables

3. **Pregunta sobre contacto:**
   - Escribe: "¿Cómo los contacto?"
   - ✅ Debe responder con información de contacto

4. **Pregunta sobre atención al cliente:**
   - Escribe: "¿Tienen otra forma de atención?"
   - ✅ Debe responder con el número de WhatsApp: +57 305 866 1668

5. **Pregunta sobre IA:**
   - Escribe: "¿Qué es inteligencia artificial?"
   - ✅ Debe responder sobre tecnologías de IA

6. **Pregunta sobre web:**
   - Escribe: "¿Hacen páginas web?"
   - ✅ Debe responder sobre desarrollo web

7. **Agradecimiento:**
   - Escribe: "Gracias"
   - ✅ Debe responder con mensaje de agradecimiento

#### C. Funcionalidades del Chatbot
- [ ] Verificar que se puede cerrar con el botón X en el header
- [ ] Verificar que los mensajes se muestran correctamente
- [ ] Verificar que aparece el indicador de carga al enviar mensaje
- [ ] Verificar que el scroll automático funciona

---

### 2. Pruebas del Formulario de Contacto

#### A. Acceso al Formulario
- [ ] Desplazarse a la sección "¿Tienes una idea?"
- [ ] Verificar que el formulario está visible

#### B. Validaciones del Formulario
1. **Enviar formulario vacío:**
   - [ ] Dejar todos los campos vacíos y enviar
   - ✅ Debe mostrar error de campos requeridos

2. **Email inválido:**
   - [ ] Ingresar email sin formato válido (ej: "test")
   - ✅ Debe mostrar error de email inválido

3. **Formulario completo:**
   - [ ] Llenar todos los campos:
     - Nombre: "Juan Pérez"
     - Email: "juan@test.com"
     - Teléfono: "3001234567" (opcional)
     - Idea: "Quiero una página web para mi negocio"
   - [ ] Enviar el formulario
   - ✅ Debe mostrar mensaje de éxito
   - ✅ Debe limpiar el formulario

#### C. Verificar Almacenamiento
- [ ] Ir a Supabase → Table Editor → `contact_messages`
- [ ] Verificar que el mensaje se guardó correctamente
- [ ] O ir a `/admin/messages` y verificar que aparece el mensaje

---

### 3. Pruebas del Speed Dial

#### A. Botón Principal
- [ ] Verificar que el botón blanco aparece en la esquina inferior derecha
- [ ] Hacer clic en el botón
- [ ] Verificar que se despliega el menú con WhatsApp y Chat

#### B. Botón de WhatsApp
- [ ] Hacer clic en el botón de WhatsApp
- [ ] Verificar que se abre WhatsApp Web/App
- [ ] Verificar que el número es: +57 305 866 1668
- [ ] Verificar que aparece el mensaje predefinido:
  "Hola, vengo desde la página web de OsorIA.tech y me gustaría obtener más información sobre cómo puedo acceder a sus servicios."

#### C. Botón de Chat
- [ ] Hacer clic en el botón de Chat
- [ ] Verificar que se abre el chatbot
- [ ] Verificar que el Speed Dial se cierra automáticamente

#### D. Cerrar el Menú
- [ ] Hacer clic en el botón X del botón principal
- [ ] Verificar que el menú se cierra

---

### 4. Pruebas del Footer

#### A. Enlaces de Texto
- [ ] Verificar que aparecen "Términos" y "Privacidad"
- [ ] Verificar que NO aparece "Contacto"
- [ ] Hacer clic en "Términos" (debe funcionar aunque esté en "#")
- [ ] Hacer clic en "Privacidad" (debe funcionar aunque esté en "#")

#### B. Botones de Redes Sociales
- [ ] Verificar que aparece el botón de LinkedIn
- [ ] Verificar que aparece el botón de Instagram
- [ ] Hacer clic en LinkedIn → Debe abrir LinkedIn
- [ ] Hacer clic en Instagram → Debe abrir: https://www.instagram.com/osoriatech
- [ ] Verificar que NO aparece el botón de WhatsApp (fue eliminado)

---

### 5. Pruebas de Navegación

#### A. Scroll Suave
- [ ] Hacer clic en el botón "Contáctanos" del hero
- [ ] Verificar que hace scroll suave hasta el formulario de contacto

#### B. Navegación a AI Demo
- [ ] Hacer clic en "Mira lo que puede generar la IA"
- [ ] Verificar que navega a `/ai-demo`
- [ ] Verificar que la página se carga correctamente

---

### 6. Pruebas de Almacenamiento en Base de Datos

#### A. Mensajes del Chatbot
1. **Enviar mensajes en el chatbot:**
   - [ ] Enviar al menos 2-3 mensajes
   - [ ] Ir a Supabase → Table Editor → `chat_conversations`
   - [ ] Verificar que los mensajes se guardaron con:
     - `session_id` único
     - `role` (user o assistant)
     - `content` (el mensaje)
     - `created_at` (timestamp)

#### B. Formularios de Contacto
1. **Enviar formulario:**
   - [ ] Completar y enviar el formulario
   - [ ] Ir a Supabase → Table Editor → `contact_messages`
   - [ ] Verificar que se guardó con:
     - `name`, `email`, `phone`, `idea`
     - `status: "nuevo"`
     - `created_at`

#### C. Panel de Administración
- [ ] Ir a `/admin/messages`
- [ ] Verificar que se cargan los mensajes
- [ ] Probar cambiar el estado de un mensaje (nuevo → en_proceso → completado)
- [ ] Verificar que el estado se actualiza

---

### 7. Pruebas de Responsive (Móvil/Tablet)

#### A. En Móvil
- [ ] Abrir la página en un dispositivo móvil o usar DevTools (F12 → Toggle device toolbar)
- [ ] Verificar que el Speed Dial se ve correctamente
- [ ] Verificar que el chatbot se adapta al tamaño de pantalla
- [ ] Verificar que el formulario es responsive
- [ ] Verificar que el footer se adapta

#### B. En Tablet
- [ ] Probar en tamaño de tablet
- [ ] Verificar que todos los elementos se ven bien

---

### 8. Pruebas de Performance

#### A. Carga de la Página
- [ ] Abrir la consola del navegador (F12)
- [ ] Verificar que no hay errores en la consola
- [ ] Verificar que las imágenes cargan correctamente
- [ ] Verificar que las animaciones funcionan

#### B. Hot Reload
- [ ] Hacer un cambio pequeño en el código
- [ ] Verificar que el servidor detecta el cambio automáticamente
- [ ] Verificar que la página se actualiza sin recargar

---

### 9. Pruebas de Integración

#### A. Supabase
- [ ] Verificar que las variables de entorno están configuradas
- [ ] Verificar que las tablas existen en Supabase
- [ ] Probar insertar datos manualmente en Supabase
- [ ] Verificar que la aplicación puede leer/escribir datos

---

## 🐛 Problemas Comunes y Soluciones

### El chatbot no responde
- ✅ Verificar que el servidor está corriendo
- ✅ Verificar la consola del navegador por errores
- ✅ Verificar que `/api/chat-simple` está funcionando

### El formulario no envía
- ✅ Verificar que Supabase está configurado
- ✅ Verificar que la tabla `contact_messages` existe
- ✅ Verificar las variables de entorno

### Los mensajes no se guardan
- ✅ Verificar que `/api/save-chat` está funcionando
- ✅ Verificar que la tabla `chat_conversations` existe
- ✅ Verificar las credenciales de Supabase

### El botón de WhatsApp no abre
- ✅ Verificar que el número está correcto: 3058661668
- ✅ Verificar que el mensaje está codificado correctamente
- ✅ Probar en diferentes navegadores

---

## 📊 Checklist Rápido

```
✅ Chatbot se abre desde Speed Dial
✅ Chatbot responde a preguntas
✅ Chatbot se puede cerrar
✅ Formulario de contacto funciona
✅ Formulario valida campos
✅ Mensajes se guardan en Supabase
✅ Speed Dial funciona correctamente
✅ Botón WhatsApp abre con mensaje
✅ Footer muestra solo LinkedIn e Instagram
✅ Navegación funciona
✅ Responsive en móvil
✅ Sin errores en consola
```

---

## 🎯 Pruebas Específicas por Funcionalidad

### Prueba del Mensaje de WhatsApp
1. Abre el Speed Dial
2. Haz clic en WhatsApp
3. Verifica que se abre WhatsApp
4. Verifica que el mensaje aparece prellenado
5. Verifica que el número es correcto

### Prueba del Flujo Completo de Contacto
1. Usuario completa formulario
2. Envía formulario
3. Ve mensaje de éxito
4. Admin ve el mensaje en `/admin/messages`
5. Admin cambia estado del mensaje

### Prueba del Flujo Completo del Chatbot
1. Usuario abre chatbot
2. Usuario envía mensaje
3. Chatbot responde
4. Mensajes se guardan en Supabase
5. Usuario cierra chatbot

---

## 📝 Notas para Pruebas

- **Prueba en diferentes navegadores:** Chrome, Firefox, Edge
- **Prueba en diferentes dispositivos:** Desktop, Tablet, Móvil
- **Prueba con diferentes datos:** Emails válidos/inválidos, textos largos/cortos
- **Prueba la persistencia:** Recarga la página y verifica que los datos se mantienen

---

¿Necesitas ayuda con alguna prueba específica? ¡Avísame!



