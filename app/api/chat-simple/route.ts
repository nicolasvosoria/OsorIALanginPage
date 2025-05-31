import { NextResponse } from "next/server"

// Respuestas predefinidas para preguntas comunes
const responses = {
  default:
    "Gracias por tu mensaje. Somos OsorIA.tech, especialistas en soluciones de IA para empresas. ¿En qué podemos ayudarte específicamente?",
  servicios:
    "Ofrecemos desarrollo de soluciones con IA, automatización de procesos, análisis predictivo de datos, desarrollo web personalizado, identificación de oportunidades tecnológicas e integración de soluciones digitales.",
  precios:
    "Nuestros precios varían según las necesidades específicas de cada proyecto. Te invitamos a contactarnos para una consulta personalizada donde podamos entender mejor tus requerimientos.",
  contacto:
    "Puedes contactarnos a través del formulario en nuestra página web, o enviando un correo a info@osoria.tech. Estaremos encantados de atenderte.",
  ia: "Trabajamos con las tecnologías de IA más avanzadas, incluyendo modelos de procesamiento de lenguaje natural, visión por computadora, y aprendizaje automático para crear soluciones personalizadas para tu negocio.",
  web: "Desarrollamos sitios web modernos, responsivos y optimizados para SEO, utilizando las últimas tecnologías como React, Next.js y diseño adaptativo para todos los dispositivos.",
  gracias: "¡Gracias a ti! Estamos para ayudarte. Si tienes más preguntas, no dudes en consultarnos.",
}

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()

    // Lógica simple para determinar la respuesta basada en palabras clave
    let response = responses.default
    const lowerMessage = message.toLowerCase()

    if (
      lowerMessage.includes("servicio") ||
      lowerMessage.includes("ofrece") ||
      lowerMessage.includes("hacen") ||
      lowerMessage.includes("productos")
    ) {
      response = responses.servicios
    } else if (
      lowerMessage.includes("precio") ||
      lowerMessage.includes("costo") ||
      lowerMessage.includes("valor") ||
      lowerMessage.includes("cuánto")
    ) {
      response = responses.precios
    } else if (
      lowerMessage.includes("contacto") ||
      lowerMessage.includes("comunicar") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("correo") ||
      lowerMessage.includes("teléfono")
    ) {
      response = responses.contacto
    } else if (
      lowerMessage.includes("ia") ||
      lowerMessage.includes("inteligencia") ||
      lowerMessage.includes("artificial") ||
      lowerMessage.includes("machine learning")
    ) {
      response = responses.ia
    } else if (
      lowerMessage.includes("web") ||
      lowerMessage.includes("página") ||
      lowerMessage.includes("sitio") ||
      lowerMessage.includes("desarrollo web")
    ) {
      response = responses.web
    } else if (
      lowerMessage.includes("gracias") ||
      lowerMessage.includes("agradezco") ||
      lowerMessage.includes("agradecido")
    ) {
      response = responses.gracias
    }

    // Simular un pequeño retraso para que parezca que está "pensando"
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error en la API de chat:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
