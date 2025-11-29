
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const answer = await req.json();

  const response = await fetch(`${process.env.LLM_API_URL}/ollama/text/answer/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
        query: {
            query: answer.query
        }
    })
  });

  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        controller.enqueue(chunk);
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}