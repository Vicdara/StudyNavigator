export interface OpenRouterGenerateOptions {
  apiKey: string;
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callOpenRouter(options: OpenRouterGenerateOptions): Promise<{ text: string; keyUsed: string }> {
  const { apiKey, model, messages, temperature = 0.3, maxTokens = 2048 } = options;

  if (!apiKey) {
    throw new Error('No OpenRouter API key configured.');
  }

  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'Study Navigator',
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
    throw new Error(`OpenRouter API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenRouter API returned an empty response');
  }

  return { text, keyUsed: `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` };
}
