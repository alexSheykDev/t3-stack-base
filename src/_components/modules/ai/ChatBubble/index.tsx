"use client";

import { useState } from "react";

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
      const trimmed = input.trim();
      if (!trimmed) return;

      const userMsg: UiMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const res = await fetch("/api/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: trimmed },
          ],
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      }
    };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex h-96 flex-col overflow-hidden rounded-xl border bg-white shadow-xl">
            <div className="flex items-center justify-between bg-primary px-4 py-2 text-primary-foreground">
              <span className="font-medium">AI Assistant</span>
              <button
                className="text-white/80 hover:text-white"
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 flex-col space-y-2 overflow-y-auto p-3 text-sm">
              {messages.length === 0 && (
                <div className="text-muted-foreground">
                  Напиши щось на кшталт:
                  <br />
                  <span className="font-medium">“Що скажеш про цей район?”</span>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

            </div>

            <div className="flex gap-2 border-t p-2">
              <input
                className="flex-1 rounded-md border px-3 py-1 text-sm"
                placeholder="Напиши повідомлення..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") await handleSend();
                }}
              />
              <button
                onClick={handleSend}
                className="rounded-md bg-primary px-3 py-1 text-primary-foreground"
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}