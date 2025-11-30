import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const answer = await req.json();

  answer.context = answer.context.map( (message) => message.text )

  console.log(answer)


  const response = await fetch(`http://localhost:8002/ollama/text/raganswer/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      //Authorization: `Bearer ${process.env.LLM_KEY}`
    },
    body: JSON.stringify({
        query: {
            query: "Please generate from provided context 2-3 words chat name that describe start of conversation. Only provide one name without any converstaion.",
            context: answer.context
        }, opt: { temperature: 0}
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

