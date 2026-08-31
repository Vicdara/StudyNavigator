import { KeyRotator } from '../key-rotator';

export interface GroqGenerateOptions {
  apiKey?: string;
  keyPool?: string[];
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callGroq(options: GroqGenerateOptions): Promise<{ text: string; keyUsed: string }> {
  const { apiKey, keyPool = [], model, messages, temperature = 0.3, maxTokens = 2048 } = options;

  const candidateKeys = KeyRotator.getAllKeysInRotationOrder('groq', keyPool, apiKey);
  if (candidateKeys.length === 0) {
    throw new Error('No Groq API keys configured in pool.');
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  let lastError: Error | null = null;

  for (let i = 0; i < candidateKeys.length; i++) {
    const key = candidateKeys[i];
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          KeyRotator.rotateOnFailure('groq', candidateKeys.length);
          lastError = new Error(`Groq key ${i + 1}/${candidateKeys.length} failed (${response.status}): ${errorText}`);
          continue;
        }
        throw new Error(`Groq API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Groq API returned an empty response');
      }

      return { text, keyUsed: `${key.slice(0, 4)}...${key.slice(-4)}` };
    } catch (err: any) {
      lastError = err;
      if (i < candidateKeys.length - 1) {
        KeyRotator.rotateOnFailure('groq', candidateKeys.length);
        continue;
      }
    }
  }

  throw lastError || new Error('All Groq keys in pool failed.');
}
