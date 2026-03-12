/**
 * NVIDIA API Chat — استدعاء نموذج qwen عبر integrate.api.nvidia.com
 */
import { AI_SYSTEM_INSTRUCTION } from '../config/aiConfig';

const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'qwen/qwen3.5-397b-a17b';

type ChatRole = 'user' | 'model';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

export async function callNvidiaChat(
  messages: ChatMessage[],
  apiKey: string,
): Promise<{ content: string } | { error: string }> {
  const nvMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: AI_SYSTEM_INSTRUCTION },
    ...messages.map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const payload = {
    model: NVIDIA_MODEL,
    messages: nvMessages,
    max_tokens: 16384,
    temperature: 0.6,
    top_p: 0.95,
    top_k: 20,
    presence_penalty: 0,
    repetition_penalty: 1,
    stream: false,
  };

  try {
    const response = await fetch(NVIDIA_INVOKE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => ({}))) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      const errMsg =
        typeof data?.error?.message === 'string'
          ? data.error.message
          : response.status === 429
            ? 'وصل حد طلبات NVIDIA.'
            : `NVIDIA API: ${response.status}`;
      return { error: errMsg };
    }

    const content =
      data?.choices?.[0]?.message?.content ?? '';
    return { content };
  } catch (err: any) {
    return { error: err?.message ?? 'فشل الاتصال بـ NVIDIA API' };
  }
}
