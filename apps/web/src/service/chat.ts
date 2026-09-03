import type { SearchResultDto } from "@my-rag-agent/shared";
import { API_BASE } from "./request";

type StreamCallbacks = {
  onSources: (sources: SearchResultDto[]) => void;
  onContent: (delta: string) => void;
  onDone: (fullAnswer: string) => void;
  onError: (message: string) => void;
};

export const chatApi = {
  stream: async (
    params: {
      knowledgeBaseId: string;
      query: string;
      topK: number;
      minSimilarity: number;
      temperature?: number;
    },
    callbacks: StreamCallbacks,
    signal?: AbortSignal,
  ): Promise<void> => {
    const baseUrl = API_BASE;
    const res = await fetch(`${baseUrl}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });
    if (!res.ok || !res.body) {
      throw new Error(`HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE events are separated by blank lines
      let idx: number;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        let eventName = "message";
        let dataStr = "";
        for (const line of rawEvent.split("\n")) {
          if (line.startsWith("event:")) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataStr += line.slice(5).trim();
          }
        }
        if (!dataStr) continue;

        try {
          const data = JSON.parse(dataStr);
          switch (eventName) {
            case "sources":
              callbacks.onSources(data.sources ?? []);
              break;
            case "content":
              callbacks.onContent(data.content ?? "");
              break;
            case "done":
              callbacks.onDone(data.answer ?? "");
              return;
            case "error":
              callbacks.onError(data.message ?? "未知错误");
              return;
          }
        } catch {
          // ignore malformed events
        }
      }
    }
  },
};
