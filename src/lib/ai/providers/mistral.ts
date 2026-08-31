import { KeyRotator } from '../key-rotator';

export interface MistralGenerateOptions {
  apiKey?: string;
  keyPool?: string[];
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callMistral(options: MistralGenerateOptions): Promise<{ text: string; keyUsed: string }> {
  const { apiKey, keyPool = [], model, messages, temperature = 0.3, maxTokens = 2048 } = options;

  const candidateKeys = KeyRotator.getAllKeysInRotationOrder('mistral', keyPool, apiKey);
  if (candidateKeys.length === 0) {
    throw new Error('No Mistral API keys configured in pool.');
  }

  const url = 'https://api.mistral.ai/v1/chat/completions';
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
          KeyRotator.rotateOnFailure('mistral', candidateKeys.length);
          lastError = new Error(`Mistral key ${i + 1}/${candidateKeys.length} failed (${response.status}): ${errorText}`);
          continue; // Try next key in pool
        }
        throw new Error(`Mistral API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('Mistral returned an empty response');
      }

      return { text, keyUsed: `${key.slice(0, 4)}...${key.slice(-4)}` };
    } catch (err: any) {
      lastError = err;
      if (i < candidateKeys.length - 1) {
        KeyRotator.rotateOnFailure('mistral', candidateKeys.length);
        continue;
      }
    }
  }

  throw lastError || new Error('All Mistral keys in pool failed.');
}
