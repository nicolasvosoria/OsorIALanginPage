import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4"),
    messages,
    temperature: 0.7,
    max_tokens: 2000, // Increase the max tokens to ensure we get a full response
    stream: true, // Ensure streaming is enabled
  })

  return result.toDataStreamResponse()
}
