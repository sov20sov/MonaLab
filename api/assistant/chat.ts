type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const messages = body?.messages as ChatMessage[] | undefined;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Missing messages array" });
    }

    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Missing GROQ_API_KEY (or legacy GEMINI_API_KEY) in environment",
      });
    }

    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages,
        stream: true,
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const details = await upstream.text().catch(() => "");
      return res.status(500).json({
        error: "Upstream AI request failed",
        status: upstream.status,
        details,
      });
    }

    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }

    return res.end();
  } catch (error: any) {
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Chat endpoint failed",
        details: String(error?.message ?? error),
      });
    }
    return res.end();
  }
}
