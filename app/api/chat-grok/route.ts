import { streamText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: xai("grok-beta"),
      messages,
      system: `Eres un asistente especializado de OsorIA.tech, una empresa colombiana de desarrollo de soluciones con inteligencia artificial. 

Información sobre OsorIA.tech:
- Desarrollamos soluciones personalizadas con IA para empresas
- Automatizamos procesos operativos
- Realizamos análisis predictivo de datos
- Creamos páginas web personalizadas
- Identificamos oportunidades tecnológicas y estratégicas
- Integramos soluciones digitales

Responde de manera amigable, profesional y en español. Mantén las respuestas concisas pero informativas. Si te preguntan sobre servicios específicos, proporciona detalles relevantes y sugiere contactar para más información.`,
      maxTokens: 500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
