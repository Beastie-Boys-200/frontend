
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const answer = await req.json();

  //const response = await fetch('http://localhost:8002/ollama/text/answer/stream', {
  const response = await fetch('http://localhost:8003/pipeline/main/thread/', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //Authorization: `Bearer ${process.env.LLM_KEY}`
    },
    body: JSON.stringify({
        //query: {
        //    query: answer.query
        //}
        query: answer.query,
        conversation_id: "123123123123"
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

