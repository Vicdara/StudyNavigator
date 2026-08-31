export type ExplanationStyle = 'intuitive' | 'analogy' | 'academic' | 'eli5' | 'step_by_step';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'researcher';
export type ResponseLength = 'concise' | 'balanced' | 'detailed';
export type VisualPreference = 'visual_first' | 'verbal_first' | 'balanced';

export type ThemePreset =
  | 'cream' // Focus Paper (Default)
  | 'minimalist' // Minimalist Pure White / Clean Slate
  | 'emerald' // Emerald Pro
  | 'obsidian' // Midnight Dark OLED
  | 'tokyo' // Tokyo Night Blue
  | 'cyberpunk' // Cyberpunk Neon Amber
  | 'rose' // Rose Quartz Pastel
  | 'nordic' // Nordic Arctic Slate
  | 'sepia' // Warm Sepia Vintage
  | 'matcha' // Matcha Zen Green
  | 'dracula' // Dracula Violet Dark
  | 'high_contrast'; // WCAG AAA High Contrast

export interface UserProfile {
  username: string;
  displayName?: string;
  email?: string;
  createdAt: string;
}

export type ReadingMode = 'continuous_scroll' | 'single_page';

export interface UserPreferences {
  explanationStyle: ExplanationStyle;
  difficultyLevel: DifficultyLevel;
  responseLength: ResponseLength;
  visualPreference: VisualPreference;
  autoPromptUnderstandingCheck: boolean;
  readingMode?: ReadingMode;
  ttsVoice?: string;
  ttsRate?: number;
  ttsPitch?: number;
  username?: string;
}

export interface ConceptNode {
  id: string;
  name: string;
  definition: string;
  pageNumber: number;
  sectionTitle: string;
  difficulty: DifficultyLevel;
  prerequisites: string[]; // IDs of prerequisite concepts
  dependents: string[]; // IDs of concepts that depend on this
  status?: 'mastered' | 'struggling' | 'learning' | 'unvisited';
  keyTakeaways?: string[];
  analogy?: string;
  visualDiagram?: string; // Mermaid or ASCII or HTML representation
}

export interface ConceptGraph {
  concepts: ConceptNode[];
  edges: {
    from?: string;
    to?: string;
    relationship?: string;
    source?: string;
    target?: string;
    label?: string;
  }[];
}

export interface DocumentSection {
  id: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  level?: number;
  summary?: string;
  conceptIds?: string[];
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  headings: string[];
  conceptIds: string[];
  tokenEstimate: number;
  summary?: string;
  images?: string[];
}

export interface DocumentData {
  id: string;
  title: string;
  filename: string;
  fileSize: number;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
  pages: DocumentPage[];
  sections: DocumentSection[];
  conceptGraph: ConceptGraph;
  description?: string;
  tags?: string[];
  fileType?: 'pdf' | 'md' | 'docx' | 'txt' | 'json';
  category?: 'ai' | 'biology' | 'physics' | 'history' | 'general' | 'genetics' | string;
  isSample?: boolean;
  rawText?: string;
  pdfDataUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  pageContext?: number;
  selectedText?: string;
  conceptReferences?: string[];
  isImLostResponse?: boolean;
  recoveryData?: ImLostDiagnosis;
  understandingCheck?: UnderstandingCheck;
  providerUsed?: string;
  modelUsed?: string;
  status?: 'sending' | 'streaming' | 'done' | 'error';
  attachedFiles?: { name: string; size: number; text?: string; imageUrl?: string }[];
}

export interface ImLostDiagnosis {
  currentPage: number;
  currentSection: string;
  detectedStruggle: string;
  missingPrerequisiteId?: string;
  missingPrerequisiteName?: string;
  missingPrerequisitePage?: number;
  whyItMatters: string;
  bridgeExplanation: string;
  analogyExplanation?: string;
  visualDiagram?: string; // ASCII, Mermaid or HTML diagram
  quickTakeaway: string;
  stepByStepPoints?: string[];
  understandingCheck?: UnderstandingCheck;
  returnToPage: number;
}

export interface UnderstandingCheck {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  conceptId: string;
  conceptName: string;
  answeredOptionId?: string;
  isCompleted?: boolean;
  isCorrect?: boolean;
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export interface TextHighlight {
  id: string;
  pageNumber: number;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

export interface DocumentMemory {
  visitedPages: number[];
  currentPage: number;
  masteredConceptIds: string[];
  strugglingConceptIds: string[];
  questionCount: number;
  imLostTriggerCount: number;
  lastActiveTimestamp: string;
  notes: { id: string; pageNumber: number; text: string; timestamp: string }[];
  bookmarks: number[];
  highlights?: TextHighlight[];
  understandingChecks?: {
    checkId: string;
    question: string;
    answeredCorrectly: boolean;
    pageNumber: number;
    timestamp: string;
  }[];
  masteryScore?: number;
}

export interface StudySession {
  id: string;
  documentId: string;
  title: string;
  createdAt: string;
  lastActiveAt: string;
  userPreferences: UserPreferences;
  messages: ChatMessage[];
  memory: DocumentMemory;
  totalStudySeconds: number;
}

export type AIProviderType = 'mistral' | 'groq' | 'opencode' | 'openrouter' | 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'autonomous';

export interface AIModelConfig {
  id: string;
  name: string;
  provider: AIProviderType;
  modelString: string;
  enabled: boolean;
  contextWindow: number;
  description: string;
  isFree?: boolean;
}

export interface AIProviderCredentials {
  mistralApiKey?: string;
  mistralKeyPool?: string[];
  groqApiKey?: string;
  groqKeyPool?: string[];
  opencodeApiKey?: string;
  opencodeKeyPool?: string[];
  openrouterApiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  ollamaBaseUrl?: string;
}

export interface AISettings {
  providers: AIProviderCredentials;
  modelPriority: string[];
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
}

export type QuickActionType =
  | 'explain_simpler'
  | 'give_analogy'
  | 'real_world_example'
  | 'step_by_step'
  | 'visual_explanation'
  | 'quiz_me'
  | 'summarize_section';
