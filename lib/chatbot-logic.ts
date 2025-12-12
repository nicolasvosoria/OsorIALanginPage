// Lógica del chatbot reutilizable
// Extraída de app/api/chat-simple/route.ts

// Base de datos de preguntas y respuestas
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
    keywords: ["logotipos", "branding", "diseño gráfico", "hacen logos"],
    response: "Sí, tenemos servicio de diseño gráfico adicional.",
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
    response: "Sí, puedes combinar web, IA y validación de WhatsApp.",
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
    keywords: ["conectar whatsapp crm", "whatsapp con crm", "integrar whatsapp crm"],
    response: "Sí, integramos con HubSpot, Zoho, Bitrix y más.",
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
    keywords: ["integrar whatsapp tienda", "whatsapp con tienda online", "whatsapp tienda"],
    response: "Sí, carrito, pedidos y notificaciones automáticas.",
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
export function findBestResponse(message: string): string {
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



