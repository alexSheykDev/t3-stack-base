import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY");
}

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.2,
});

function toLangChainMessages(msgs: ChatMessage[]) {
  return msgs.map((m) => {
    if (m.role === "system") return new SystemMessage(m.content);
    if (m.role === "assistant") return new AIMessage(m.content);
    return new HumanMessage(m.content);
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function chunkToText(chunk: any): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const content = chunk?.content;
  if (!content) return "";

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((c) => {
        if (typeof c === "string") return c;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
        if ("text" in c && typeof c.text === "string") return c.text;
        return "";
      })
      .join("");
  }

  return "";
}

export async function POST(req: Request): Promise<Response> {
  const body = (await req.json()) as { messages: ChatMessage[] };

  const lcMessages = toLangChainMessages(body.messages);

  // LangChain streaming: returns AsyncIterable of AIMessageChunk
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const stream = await model.stream(lcMessages);

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        for await (const chunk of stream as AsyncIterable<never>) {
          const text = chunkToText(chunk);
          if (text) {
            controller.enqueue(encoder.encode(text));
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