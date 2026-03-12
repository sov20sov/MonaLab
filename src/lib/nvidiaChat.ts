import axios from 'axios';
import { AI_SYSTEM_INSTRUCTION } from '../config/aiConfig';

const NVIDIA_INVOKE_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_MODEL = 'moonshotai/kimi-k2.5';

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
    temperature: 0.7,
    top_p: 0.95,
    stream: false,
    chat_template_kwargs: { thinking: true },
  };

  try {
    const response = await axios.post(NVIDIA_INVOKE_URL, payload, {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = response.data as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { message?: string };
    };

    if (data?.error?.message) {
      return { error: data.error.message };
    }

    const content = data?.choices?.[0]?.message?.content ?? '';
    return { content };
  } catch (err: any) {
    return { error: err?.message ?? 'فشل الاتصال بـ NVIDIA API' };
  }
}

