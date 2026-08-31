export interface OpenAIGenerateOptions {
  apiKey: string;
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callOpenAI(options: OpenAIGenerateOptions): Promise<string> {
  const { apiKey, model, messages, temperature = 0.3, maxTokens = 2048 } = options;

  const url = 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
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
    throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenAI API returned an empty response');
  }

  return text;
}
