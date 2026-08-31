export interface GeminiGenerateOptions {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  contents: { role: 'user' | 'model'; parts: { text: string }[] }[];
  temperature?: number;
  maxOutputTokens?: number;
  stream?: boolean;
}

export async function callGemini(options: GeminiGenerateOptions): Promise<string> {
  const { apiKey, model, systemInstruction, contents, temperature = 0.3, maxOutputTokens = 2048 } = options;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response');
  }

  return text;
}
