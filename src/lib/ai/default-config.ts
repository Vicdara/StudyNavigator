import { AIModelConfig, AISettings } from '@/types';

export const AVAILABLE_MODELS: AIModelConfig[] = [
  {
    id: 'mistral-large',
    name: 'Mistral Large Latest (Primary)',
    provider: 'mistral',
    modelString: 'mistral-large-latest',
    enabled: true,
    contextWindow: 128000,
    description: 'Flagship reasoning tutor model with 6-key auto-rotation pool',
    isFree: true,
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small Latest',
    provider: 'mistral',
    modelString: 'mistral-small-latest',
    enabled: true,
    contextWindow: 32000,
    description: 'Fast backup model with 6-key rotation pool',
    isFree: true,
  },
  {
    id: 'mistral-nemo',
    name: 'Mistral Nemo',
    provider: 'mistral',
    modelString: 'open-mistral-nemo',
    enabled: true,
    contextWindow: 128000,
    description: 'High-reliability open model via Mistral AI',
    isFree: true,
  },
  {
    id: 'opencode-nemotron',
    name: 'OpenCode Nemotron Ultra',
    provider: 'opencode',
    modelString: 'nemotron-ultra',
    enabled: true,
    contextWindow: 128000,
    description: 'OpenCode 7-key auto-rotation pool model',
    isFree: true,
  },
  {
    id: 'opencode-laguna',
    name: 'OpenCode Laguna',
    provider: 'opencode',
    modelString: 'laguna',
    enabled: true,
    contextWindow: 64000,
    description: 'OpenCode secondary rotation model',
    isFree: true,
  },
  {
    id: 'groq-gpt-oss-120b',
    name: 'Groq GPT-OSS 120B (High Speed LPU)',
    provider: 'groq',
    modelString: 'openai/gpt-oss-120b',
    enabled: true,
    contextWindow: 128000,
    description: 'Ultra-fast 120B reasoning via Groq with 5-key rotation pool',
    isFree: true,
  },
  {
    id: 'groq-qwen-3.8',
    name: 'Groq Qwen 3.8 27B',
    provider: 'groq',
    modelString: 'qwen/qwen3.8-27b',
    enabled: true,
    contextWindow: 128000,
    description: 'High-rigor math & coding model via Groq LPU',
    isFree: true,
  },
  {
    id: 'autonomous-engine',
    name: 'Autonomous Document Knowledge Engine',
    provider: 'autonomous',
    modelString: 'builtin-rag-heuristics-v1',
    enabled: true,
    contextWindow: 64000,
    description: 'Zero-key instant local semantic synthesizer (Guaranteed 100% offline uptime)',
    isFree: true,
  },
];

const getEnvPool = (key: string, defaultVal: string = ''): string[] => {
  try {
    const envVal = (import.meta as any).env?.[key] || defaultVal;
    if (envVal && typeof envVal === 'string') {
      return envVal.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
  } catch {
    // ignore env access errors
  }
  return defaultVal ? [defaultVal] : [];
};

const MISTRAL_POOL = getEnvPool('VITE_MISTRAL_API_KEYS', (import.meta as any).env?.VITE_MISTRAL_API_KEY || '');
const OPENCODE_POOL = getEnvPool('VITE_OPENCODE_API_KEYS', (import.meta as any).env?.VITE_OPENCODE_API_KEY || '');
const GROQ_POOL = getEnvPool('VITE_GROQ_API_KEYS', (import.meta as any).env?.VITE_GROQ_API_KEY || '');

export const DEFAULT_AI_SETTINGS: AISettings = {
  providers: {
    mistralApiKey: MISTRAL_POOL[0] || '',
    mistralKeyPool: MISTRAL_POOL,
    opencodeApiKey: OPENCODE_POOL[0] || '',
    opencodeKeyPool: OPENCODE_POOL,
    groqApiKey: GROQ_POOL[0] || '',
    groqKeyPool: GROQ_POOL,
    openrouterApiKey: (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '',
    geminiApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    ollamaBaseUrl: 'http://localhost:11434',
  },
  modelPriority: [
    'mistral-large',
    'mistral-small',
    'mistral-nemo',
    'opencode-nemotron',
    'opencode-laguna',
    'groq-gpt-oss-120b',
    'groq-qwen-3.8',
    'autonomous-engine',
  ],
  temperature: 0.3,
  maxTokens: 1500,
  timeoutMs: 8000,
  maxRetries: 2,
};
