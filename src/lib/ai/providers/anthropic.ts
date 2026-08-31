export interface AnthropicGenerateOptions {
  apiKey: string;
  model: string;
  system?: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
  temperature?: number;
  maxTokens?: number;
}

export async function callAnthropic(options: AnthropicGenerateOptions): Promise<string> {
  const { apiKey, model, system, messages, temperature = 0.3, maxTokens = 2048 } = options;

  const url = 'https://api.anthropic.com/v1/messages';

  const body: any = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages,
  };

  if (system) {
    body.system = system;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) {
    throw new Error('Anthropic API returned an empty response');
  }

  return text;
}
