import { NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { openai } from "@ai-sdk/openai"

// Base de datos de preguntas y respuestas (usada como fallback)
const faqDatabase: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["qué servicios", "servicios ofrecen", "que ofrecen", "servicios tienen"],
    response: "Ofrecemos creación de páginas web, análisis de datos con IA, desarrollo web/móvil y soporte para validación en Meta.",
  },
  {
    keywords: ["cuánto cuesta", "costo página web", "precio página web", "cuanto cuesta web básica", "precio web básica"],
    response: "Una web básica inicia desde $X según funcionalidades. Podemos cotizarte según tu necesidad.",
  },
  {
    keywords: ["cuánto tiempo", "tiempo entregan", "tiempo entrega", "cuanto tardan", "días entregan"],
    response: "El tiempo promedio es entre 7 y 15 días, dependiendo del alcance.",
  },
  {
    keywords: ["tiendas virtuales", "tienda virtual", "ecommerce", "e-commerce", "tienda online"],
    response: "Sí, creamos tiendas online completas con carrito de compras y pasarelas de pago.",
  },
  {
    keywords: ["pagar por partes", "pago por etapas", "pagos parciales", "pago fraccionado"],
    response: "Sí, manejamos pagos por etapas del proyecto.",
  },
  {
    keywords: ["análisis de datos", "análisis datos ia", "análisis con inteligencia artificial", "datos con ia"],
    response: "Sí, creamos reportes, dashboards y modelos predictivos con IA.",
  },
  {
    keywords: ["costo análisis", "precio análisis datos", "cuánto cuesta análisis", "precio análisis"],
    response: "Depende del volumen y complejidad, desde $X. Cotizamos gratis.",
  },
  {
    keywords: ["qué necesito", "necesito para iniciar", "requisitos para iniciar", "qué se necesita"],
    response: "Solo una llamada o chat para definir objetivos y recopilar tu información.",
  },
  {
    keywords: ["wordpress", "trabajan con wordpress", "usan wordpress"],
    response: "Sí, trabajamos con WordPress y desarrollo personalizado.",
  },
  {
    keywords: ["apps móviles", "aplicaciones móviles", "app móvil", "desarrollan apps"],
    response: "Sí, desarrollamos aplicaciones móviles para Android y iOS.",
  },
  {
    keywords: ["integrar pagos", "pagos en línea", "pasarelas de pago", "métodos de pago"],
    response: "Claro, integramos PayU, MercadoPago, Wompi, Stripe y más.",
  },
  {
    keywords: ["mejorar página web", "rediseñar página", "mejorar web actual", "rediseño web"],
    response: "Sí, hacemos rediseño total o parcial.",
  },
  {
    keywords: ["validación whatsapp meta", "qué es validación whatsapp", "validación whatsapp en meta"],
    response: "Es el proceso para verificar tu número y acceder a las funciones oficiales de WhatsApp Business API.",
  },
  {
    keywords: ["ayudan verificación", "verificación número meta", "ayudan con verificación"],
    response: "Sí, hacemos acompañamiento completo en el proceso.",
  },
  {
    keywords: ["automatizar ventas whatsapp", "automatizar whatsapp", "ventas automatizadas whatsapp"],
    response: "Sí, mediante chatbots, flujos y conexión con la CRM.",
  },
  {
    keywords: ["desarrollan chatbots", "hacen chatbots", "crean chatbots", "chatbot personalizado"],
    response: "Sí, realizamos bots personalizados para WhatsApp y web.",
  },
  {
    keywords: ["tipos de páginas", "qué páginas crean", "tipos páginas web"],
    response: "Landing pages, corporativas, tiendas online, e-commerce y sistemas administrativos.",
  },
  {
    keywords: ["posicionamiento seo", "hacen seo", "optimización seo", "seo"],
    response: "Sí, ofrecemos optimización SEO básica y avanzada.",
  },
  {
    keywords: ["conectar sistemas externos", "integrar sistemas", "conexión con sistemas", "integración sistemas"],
    response: "Sí, integramos APIs y servicios externos.",
  },
  {
    keywords: ["reservaciones en línea", "sistema reservas", "reservas online", "agenda digital"],
    response: "Sí, implementamos sistemas de reservas y agenda digital.",
  },
  {
    keywords: ["cómo funcionan análisis", "funcionan análisis datos ia", "análisis datos cómo funciona"],
    response: "Recolectamos tus datos, los procesamos y generamos reportes automáticos y predictivos.",
  },
  {
    keywords: ["herramientas análisis", "qué herramientas usan", "herramientas para análisis"],
    response: "Python, Power BI, Tableau y modelos de IA.",
  },
  {
    keywords: ["dashboard automatizado", "dashboard en tiempo real", "dashboards automáticos"],
    response: "Sí, dashboards conectados a los datos en tiempo real.",
  },
  {
    keywords: ["modificación proyecto", "cambios proyecto entregado", "modificar proyecto"],
    response: "Sí, manejamos paquetes de soporte.",
  },
  {
    keywords: ["costo soporte mensual", "precio soporte", "cuánto soporte mensual"],
    response: "Depende del nivel de soporte, desde $X.",
  },
  {
    keywords: ["integrar whatsapp sitio", "whatsapp con sitio web", "botón whatsapp web"],
    response: "Sí, botones, enlaces directos o chatbots completos.",
  },
  {
    keywords: ["whatsapp api sin empresa", "whatsapp api empresa registrada", "api sin empresa"],
    response: "No, se requiere una cuenta empresarial verificada. Te guiamos en ese proceso.",
  },
  {
    keywords: ["logotipos", "branding", "diseño gráfico", "hacen logos"],
    response: "Sí, tenemos servicio de diseño gráfico adicional.",
  },
  {
    keywords: ["beneficios validar número", "beneficios validación meta", "ventajas validación"],
    response: "Mayor capacidad de envío, plantillas masivas y verificación.",
  },
  {
    keywords: ["recuperar número bloqueado", "número bloqueado whatsapp", "recuperar whatsapp bloqueado"],
    response: "En algunos casos sí, dependiendo del estado.",
  },
  {
    keywords: ["facturación electrónica", "facturación en web", "factura electrónica web"],
    response: "Sí, integramos pasarelas y sistemas autorizados.",
  },
  {
    keywords: ["crm a medida", "crm personalizado", "desarrollan crm"],
    response: "Sí, desarrollamos plataformas personalizadas.",
  },
  {
    keywords: ["información entregar página web", "qué información necesitan", "datos para página web"],
    response: "Logo, textos, imágenes y aviso de funcionalidades deseadas.",
  },
  {
    keywords: ["generar contenido", "crear contenido página", "redacción contenido"],
    response: "Sí, ofrecemos servicio de redacción profesional.",
  },
  {
    keywords: ["entregan factura", "emiten factura", "facturan"],
    response: "Sí, emitimos factura según lo requerido.",
  },
  {
    keywords: ["conectar tienda inventario", "sincronización inventarios", "inventario físico tienda"],
    response: "Sí, hacemos sincronización de inventarios.",
  },
  {
    keywords: ["integrar envíos", "envíos en línea", "conectar envíos"],
    response: "Sí, conectamos con Servientrega, Coordinadora, Envia, etc.",
  },
  {
    keywords: ["optimizadas móviles", "responsive", "adaptado móvil", "móvil responsive"],
    response: "Sí, todas son responsive.",
  },
  {
    keywords: ["administrar página después", "acceso administración", "puedo administrar"],
    response: "Sí, te damos acceso y capacitación.",
  },
  {
    keywords: ["campañas marketing digital", "marketing digital", "meta ads", "google ads"],
    response: "Sí, campañas en Meta Ads, Google Ads y más.",
  },
  {
    keywords: ["formas de pago aceptan", "métodos de pago aceptan", "cómo puedo pagar"],
    response: "Transferencia, tarjeta, pasarelas online.",
  },
  {
    keywords: ["más de un servicio", "combinar servicios", "varios servicios"],
    response: "Sí, puedes combinar web e IA según tus necesidades.",
  },
  {
    keywords: ["auditorías de datos", "auditoría datos", "evaluación datos"],
    response: "Sí, evaluamos calidad, estructura y oportunidades.",
  },
  {
    keywords: ["sistema de turnos", "turneros", "sistema turnos"],
    response: "Sí, desarrollamos turneros personalizados.",
  },
  {
    keywords: ["sistemas restaurantes", "sistema para restaurante", "restaurantes"],
    response: "Sí, menús digitales, pedidos, domicilios y pagos.",
  },
  {
    keywords: ["automatizar reportes", "reportes automáticos", "reportes automatizados"],
    response: "Sí, reportes automáticos diarios, semanales o mensuales.",
  },
  {
    keywords: ["qué es una api", "qué es api", "qué significa api"],
    response: "Es una interfaz que permite conectar sistemas entre sí.",
  },
  {
    keywords: ["cuál servicio necesito", "qué servicio necesito", "cómo sé qué servicio"],
    response: "Te guiamos según tu objetivo: ventas, automatización o presencia online.",
  },
  {
    keywords: ["sistema de membresías", "membresías", "sistema membresías"],
    response: "Sí, con control de pagos y acceso por niveles.",
  },
  {
    keywords: ["aplicaciones tipo uber", "app tipo rappi", "app como uber"],
    response: "Sí, dependiendo del alcance y presupuesto.",
  },
  {
    keywords: ["mejorar velocidad carga", "optimizar velocidad", "velocidad de carga web"],
    response: "Sí, optimizamos código, imágenes y hosting.",
  },
  {
    keywords: ["hosting y dominio", "ofrecen hosting", "dominio y hosting"],
    response: "Sí, con precios preferenciales.",
  },
  {
    keywords: ["migrar web actual", "migración web", "migrar mi web"],
    response: "Sí, migramos a un servidor seguro.",
  },
  {
    keywords: ["ofrecen garantías", "garantía", "tienen garantía"],
    response: "Sí, entregamos garantía por funcionamiento del desarrollo.",
  },
  {
    keywords: ["se cae mi página", "página caída", "qué pasa si cae"],
    response: "Nuestro soporte puede restaurarla rápidamente.",
  },
  {
    keywords: ["landing pages campañas", "landing page campaña", "landing para campaña"],
    response: "Sí, orientadas a ventas y conversión.",
  },
  {
    keywords: ["análisis ventas por ia", "análisis ventas ia", "ventas con ia"],
    response: "Sí, identificamos patrones, predicciones y recomendaciones.",
  },
  {
    keywords: ["cómo controlar servicio", "controlar servicio", "iniciar servicio", "iniciar"],
    response: "Solo envíanos un mensaje con la palabra INICIAR y te guiamos.",
  },
  {
    keywords: ["atencion", "atención", "otra forma", "whatsapp", "whats app", "contacto whatsapp"],
    response: "Además de este chat, también puedes contactarnos por WhatsApp al número +57 305 866 1668. Estamos disponibles para atenderte y resolver todas tus dudas.",
  },
  {
    keywords: ["gracias", "agradezco", "agradecido", "muchas gracias"],
    response: "¡Gracias a ti! Estamos para ayudarte. Si tienes más preguntas, no dudes en consultarnos.",
  },
]

// Respuesta por defecto
const defaultResponse =
  "Gracias por tu mensaje. Somos OsorIA.tech, especialistas en soluciones de IA para empresas. ¿En qué podemos ayudarte específicamente? Puedes preguntarme sobre nuestros servicios, precios, tiempos de entrega y más."

// Función para encontrar la mejor respuesta basada en palabras clave
function findBestResponse(message: string): string {
  const lowerMessage = message.toLowerCase().trim()

  // Buscar la mejor coincidencia
  let bestMatch = null
  let maxMatches = 0

  for (const faq of faqDatabase) {
    let matches = 0
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matches++
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches
      bestMatch = faq
    }
  }

  // Si encontramos una coincidencia con al menos una palabra clave, devolver esa respuesta
  if (bestMatch && maxMatches > 0) {
    return bestMatch.response
  }

  // Si no hay coincidencias, devolver la respuesta por defecto
  return defaultResponse
}

// Función para obtener contexto relevante del FAQ basado en el mensaje
function getRelevantFAQContext(message: string, maxItems: number = 5): string {
  const lowerMessage = message.toLowerCase().trim()
  
  // Calcular relevancia de cada FAQ
  const faqWithScores = faqDatabase.map((faq) => {
    let score = 0
    for (const keyword of faq.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        score += 1
      }
    }
    return { faq, score }
  })

  // Ordenar por relevancia y tomar los más relevantes
  const relevantFAQs = faqWithScores
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxItems)
    .map((item) => item.faq)

  // Si no hay FAQs relevantes, tomar algunos generales
  if (relevantFAQs.length === 0) {
    return faqDatabase.slice(0, 5).map((faq) => {
      const question = faq.keywords[0]
      return `P: ${question}\nR: ${faq.response}`
    }).join('\n\n')
  }

  // Formatear como contexto
  return relevantFAQs.map((faq) => {
    const question = faq.keywords[0]
    return `P: ${question}\nR: ${faq.response}`
  }).join('\n\n')
}

export async function POST(req: Request) {
  try {
    const { message, sessionId, messages: conversationHistory } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 })
    }

    // Verificar si hay API keys configuradas
    const deepseekApiKey = process.env.DEEPSEEK_API_KEY
    const openaiApiKey = process.env.OPENAI_API_KEY

    console.log("🔍 Debug - DEEPSEEK_API_KEY configurada:", !!deepseekApiKey)
    console.log("🔍 Debug - OPENAI_API_KEY configurada:", !!openaiApiKey)

    // Construir el historial de conversación
    const history = conversationHistory || []
    
    // Filtrar y formatear el historial correctamente
    // Excluir mensajes vacíos o inválidos
    const formattedHistory = history
      .filter((msg: any) => msg && msg.role && msg.content && typeof msg.content === "string" && msg.content.trim().length > 0)
      .map((msg: any) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content.trim(),
      }))
    
    // Verificar si el último mensaje del historial es el mensaje actual
    const lastMessage = formattedHistory[formattedHistory.length - 1]
    const isLastMessageCurrent = lastMessage && lastMessage.role === "user" && lastMessage.content === message.trim()
    
    // Construir el array de mensajes final
    const allMessages = isLastMessageCurrent
      ? formattedHistory
      : [
          ...formattedHistory,
          {
            role: "user" as const,
            content: message.trim(),
          },
        ]
    
    // Limitar el historial a los últimos 10 mensajes para evitar tokens excesivos
    const limitedMessages = allMessages.slice(-10)
    
    console.log("💬 Historial de mensajes (últimos 10):", JSON.stringify(limitedMessages, null, 2))
    console.log("📝 Mensaje actual:", message)

    // Intentar usar IA real
    try {
      let response: string

      // Obtener contexto relevante del FAQ
      const faqContext = getRelevantFAQContext(message, 8)
      console.log("📚 Contexto FAQ extraído:", faqContext.substring(0, 200) + "...")

      // Prioridad 1: DeepSeek si está configurado
      if (deepseekApiKey) {
        console.log("🤖 Usando DeepSeek para generar respuesta...")
        console.log("🔑 API Key presente (primeros 20 chars):", deepseekApiKey.substring(0, 20) + "...")
        console.log("📝 Mensaje del usuario:", message.substring(0, 100))
        console.log("📊 Número de mensajes en historial:", limitedMessages.length)
        try {
          // El SDK de DeepSeek detecta automáticamente DEEPSEEK_API_KEY de las variables de entorno
          // No necesitamos pasarla explícitamente
          const result = await generateText({
            model: deepseek("deepseek-chat"),
            messages: [
              {
                role: "system",
                content: `Eres un asistente especializado de OsorIA.tech, una empresa colombiana de desarrollo de soluciones con inteligencia artificial.

Información sobre OsorIA.tech:
- Desarrollamos soluciones personalizadas con IA para empresas
- Automatizamos procesos operativos
- Realizamos análisis predictivo de datos
- Creamos páginas web personalizadas
- Identificamos oportunidades tecnológicas y estratégicas
- Integramos soluciones digitales
- Ofrecemos servicios de desarrollo web, aplicaciones móviles, e-commerce, análisis de datos, automatización, chatbots, y más

CONTEXTO DE PREGUNTAS FRECUENTES (usa esta información para responder con precisión):
${faqContext}

INSTRUCCIONES:
- Responde de manera amigable, profesional y en español
- Usa la información del contexto de FAQ cuando sea relevante
- Mantén las respuestas concisas pero informativas (máximo 3-4 párrafos)
- Si te preguntan sobre servicios específicos, proporciona detalles relevantes basándote en el contexto
- Si no sabes algo específico, sugiere contactar por WhatsApp al +57 305 866 1668
- Adapta las respuestas del FAQ a un lenguaje natural y conversacional
- No inventes información que no esté en el contexto
- Responde directamente a la pregunta del usuario sin repetir la pregunta`,
              },
              ...limitedMessages,
            ],
            maxTokens: 500,
            temperature: 0.7,
          })

          response = result.text?.trim() || ""
          if (!response) {
            console.error("⚠️ La respuesta de DeepSeek está vacía, usando fallback")
            response = findBestResponse(message)
          } else {
            console.log("✅ Respuesta generada por DeepSeek (longitud:", response.length, "):", response.substring(0, 150) + "...")
          }
        } catch (deepseekError: any) {
          console.error("❌ Error específico de DeepSeek:", deepseekError)
          console.error("❌ Detalles del error:", JSON.stringify(deepseekError, null, 2))
          // Si es un error de autenticación o API, no intentar fallback
          if (deepseekError?.cause?.status === 401 || deepseekError?.cause?.status === 403) {
            throw new Error("Error de autenticación con DeepSeek. Verifica tu API key.")
          }
          throw deepseekError
        }
      }
      // Prioridad 2: OpenAI si está configurado
      else if (openaiApiKey) {
        console.log("🤖 Usando OpenAI para generar respuesta...")
        const result = await generateText({
          model: openai("gpt-4o-mini"),
          messages: [
            {
              role: "system",
              content: `Eres un asistente especializado de OsorIA.tech, una empresa colombiana de desarrollo de soluciones con inteligencia artificial.

Información sobre OsorIA.tech:
- Desarrollamos soluciones personalizadas con IA para empresas
- Automatizamos procesos operativos
- Realizamos análisis predictivo de datos
- Creamos páginas web personalizadas
- Identificamos oportunidades tecnológicas y estratégicas
- Integramos soluciones digitales
- Ofrecemos servicios de desarrollo web, aplicaciones móviles, e-commerce, análisis de datos, automatización, chatbots, y más

CONTEXTO DE PREGUNTAS FRECUENTES (usa esta información para responder con precisión):
${faqContext}

INSTRUCCIONES:
- Responde de manera amigable, profesional y en español
- Usa la información del contexto de FAQ cuando sea relevante
- Mantén las respuestas concisas pero informativas
- Si te preguntan sobre servicios específicos, proporciona detalles relevantes basándote en el contexto
- Si no sabes algo específico, sugiere contactar por WhatsApp al +57 305 866 1668
- Adapta las respuestas del FAQ a un lenguaje natural y conversacional
- Responde directamente a la pregunta del usuario sin repetir la pregunta`,
            },
            ...limitedMessages,
          ],
          maxTokens: 500,
        })

        response = result.text?.trim() || ""
        if (!response) {
          console.error("⚠️ La respuesta de OpenAI está vacía, usando fallback")
          response = findBestResponse(message)
        } else {
          console.log("✅ Respuesta generada por OpenAI (longitud:", response.length, "):", response.substring(0, 150) + "...")
        }
      }
      // Fallback: usar FAQ si no hay API keys
      else {
        console.log("📋 Usando FAQ como fallback (no hay API keys configuradas)")
        response = findBestResponse(message)
      }

      return NextResponse.json({ response })
    } catch (aiError) {
      console.error("Error al usar IA:", aiError)
      // Si falla la IA, usar el FAQ como fallback
      const fallbackResponse = findBestResponse(message)
      return NextResponse.json({ response: fallbackResponse })
    }
  } catch (error) {
    console.error("Error en la API de chat:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
