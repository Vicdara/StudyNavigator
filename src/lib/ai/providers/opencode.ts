import { KeyRotator } from '../key-rotator';

export interface OpenCodeGenerateOptions {
  apiKey?: string;
  keyPool?: string[];
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callOpenCode(options: OpenCodeGenerateOptions): Promise<{ text: string; keyUsed: string }> {
  const { apiKey, keyPool = [], model, messages, temperature = 0.3, maxTokens = 2048 } = options;

  const candidateKeys = KeyRotator.getAllKeysInRotationOrder('opencode', keyPool, apiKey);
  if (candidateKeys.length === 0) {
    throw new Error('No OpenCode API keys configured in pool.');
  }

  // OpenCode API endpoint
  const url = 'https://api.opencode.ai/v1/chat/completions';
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
          KeyRotator.rotateOnFailure('opencode', candidateKeys.length);
          lastError = new Error(`OpenCode key ${i + 1}/${candidateKeys.length} failed (${response.status}): ${errorText}`);
          continue;
        }
        throw new Error(`OpenCode API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('OpenCode returned an empty response');
      }

      return { text, keyUsed: `${key.slice(0, 4)}...${key.slice(-4)}` };
    } catch (err: any) {
      lastError = err;
      if (i < candidateKeys.length - 1) {
        KeyRotator.rotateOnFailure('opencode', candidateKeys.length);
        continue;
      }
    }
  }

  throw lastError || new Error('All OpenCode keys in pool failed.');
}
