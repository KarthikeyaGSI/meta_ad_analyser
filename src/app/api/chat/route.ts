import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check if OpenAI key exists, otherwise return a mock stream
    if (!process.env.OPENAI_API_KEY) {
      const mockStream = new ReadableStream({
        async start(controller) {
          const text = "I'm the Vero AI Assistant running in Sandbox mode (No OPENAI_API_KEY). \n\nI noticed your **Creative 3** has a fatigue score of 8/10 and ROAS dropped by 14% yesterday. Would you like me to deploy a new n8n-style workflow to automatically pause it?";
          const words = text.split(' ');
          for (const word of words) {
            controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(word + ' ')}\n`));
            await new Promise((resolve) => setTimeout(resolve, 50)); // simulate typing
          }
          controller.close();
        },
      });
      return new Response(mockStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      messages,
      system: 'You are Vero AI, a deterministic advertising guardrail assistant. You help performance marketers optimize their Meta Ads. Speak precisely, cite metrics, and offer automated workflows as solutions.',
    });

    // @ts-ignore - The method name changes depending on the specific AI SDK version (toTextStreamResponse or toDataStreamResponse)
    return result.toTextStreamResponse ? result.toTextStreamResponse() : result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: "Failed to process chat" }), { status: 500 });
  }
}
