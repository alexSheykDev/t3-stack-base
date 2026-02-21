import OpenAI from "openai";

export const runtime = "edge";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY");
}

// OpenAI SDK типізований неідеально, тому ESLint думає, що тут any.
// Глушимо rule тільки для цієї лінії.
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const openai = new OpenAI({ apiKey });

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatStreamChunk = {
  choices: {
    delta?: {
      content?: string;
    };
  }[];
};

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { messages: ChatMessage[] };

  // OpenAI для stream повертає значення типу any, тому тут одна локальна поблажка
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  const rawStream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    stream: true,
    messages: body.messages,
  });

  const stream = rawStream as AsyncIterable<ChatStreamChunk>;

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const firstChoice: ChatStreamChunk["choices"][number] | undefined =
            chunk.choices[0];

          const delta: string | undefined = firstChoice?.delta?.content;

          if (delta) {
            controller.enqueue(encoder.encode(delta));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}