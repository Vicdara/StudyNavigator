export interface OllamaGenerateOptions {
  baseUrl?: string;
  model: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  temperature?: number;
}

export async function callOllama(options: OllamaGenerateOptions): Promise<string> {
  const { baseUrl = 'http://localhost:11434', model, messages, temperature = 0.3 } = options;

  const url = `${baseUrl.replace(/\/$/, '')}/api/chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.message?.content;
  if (!text) {
    throw new Error('Ollama returned empty content');
  }

  return text;
}
