import {
  AISettings,
  DocumentPage,
  ConceptNode,
  UserPreferences,
  DocumentMemory,
  ImLostDiagnosis,
} from '@/types';
import { AVAILABLE_MODELS, DEFAULT_AI_SETTINGS } from './default-config';
import { callMistral } from './providers/mistral';
import { callGroq } from './providers/groq';
import { callOpenCode } from './providers/opencode';
import { callOpenRouter } from './providers/openrouter';
import { callGemini } from './providers/gemini';
import { callOpenAI } from './providers/openai';
import { callAnthropic } from './providers/anthropic';
import { callOllama } from './providers/ollama';
import { AutonomousKnowledgeEngine } from './providers/autonomous';
import { buildSystemPrompt, buildImLostPrompt } from './prompts';

export interface GenerateTextParams {
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
  systemPrompt?: string;
  currentPage?: DocumentPage;
  surroundingPages?: DocumentPage[];
  allConcepts?: ConceptNode[];
  preferences?: UserPreferences;
  memory?: DocumentMemory;
  selectedText?: string;
  query?: string;
  settings?: AISettings;
  documentTitle?: string;
  stream?: boolean;
}

export interface GenerateResult {
  text: string;
  modelUsed: string;
  providerUsed: string;
  fallbackCount: number;
  attempts: { model: string; error?: string; success: boolean }[];
}

export class AIProviderManager {
  private settings: AISettings;

  constructor(customSettings?: Partial<AISettings>) {
    this.settings = { ...DEFAULT_AI_SETTINGS, ...(customSettings || {}) };
  }

  public updateSettings(newSettings: AISettings) {
    this.settings = newSettings;
  }

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`Model request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timer!);
      return result;
    } catch (err) {
      clearTimeout(timer!);
      throw err;
    }
  }

  async generateChatResponse(params: GenerateTextParams): Promise<GenerateResult> {
    const {
      messages,
      systemPrompt,
      currentPage,
      surroundingPages = [],
      allConcepts = [],
      preferences = {
        explanationStyle: 'intuitive',
        difficultyLevel: 'intermediate',
        responseLength: 'balanced',
        visualPreference: 'visual_first',
        autoPromptUnderstandingCheck: true,
      },
      memory,
      selectedText,
      query,
      documentTitle,
    } = params;

    const fullSystemPrompt =
      systemPrompt ||
      buildSystemPrompt(preferences, memory, {
        documentTitle,
        currentPage,
        allPages: surroundingPages.length > 0 ? surroundingPages : currentPage ? [currentPage] : [],
        allConcepts,
      });
    const cleanMessages = messages.map((m) => ({ role: m.role, content: m.content }));

    const priorityList = this.settings.modelPriority || DEFAULT_AI_SETTINGS.modelPriority;
    const attempts: { model: string; error?: string; success: boolean }[] = [];
    let fallbackCount = 0;

    for (const modelId of priorityList) {
      const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!modelConfig || !modelConfig.enabled) continue;

      try {
        let text = '';
        const timeout = this.settings.timeoutMs || 12000;

        switch (modelConfig.provider) {
          case 'mistral': {
            const apiKey = this.settings.providers.mistralApiKey;
            const keyPool = this.settings.providers.mistralKeyPool || DEFAULT_AI_SETTINGS.providers.mistralKeyPool;
            const apiMessages = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            const res = await this.executeWithTimeout(
              callMistral({
                apiKey,
                keyPool,
                model: modelConfig.modelString,
                messages: apiMessages,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            text = res.text;
            break;
          }

          case 'groq': {
            const apiKey = this.settings.providers.groqApiKey;
            const keyPool = this.settings.providers.groqKeyPool || DEFAULT_AI_SETTINGS.providers.groqKeyPool;
            const groqMsgs = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            const res = await this.executeWithTimeout(
              callGroq({
                apiKey,
                keyPool,
                model: modelConfig.modelString,
                messages: groqMsgs,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            text = res.text;
            break;
          }

          case 'opencode': {
            const apiKey = this.settings.providers.opencodeApiKey;
            const keyPool = this.settings.providers.opencodeKeyPool || DEFAULT_AI_SETTINGS.providers.opencodeKeyPool;
            const opencodeMsgs = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            const res = await this.executeWithTimeout(
              callOpenCode({
                apiKey,
                keyPool,
                model: modelConfig.modelString,
                messages: opencodeMsgs,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            text = res.text;
            break;
          }

          case 'openrouter': {
            const apiKey = this.settings.providers.openrouterApiKey || DEFAULT_AI_SETTINGS.providers.openrouterApiKey;
            if (!apiKey) throw new Error('No OpenRouter API key configured');
            const openRouterMsgs = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            const res = await this.executeWithTimeout(
              callOpenRouter({
                apiKey,
                model: modelConfig.modelString,
                messages: openRouterMsgs,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            text = res.text;
            break;
          }

          case 'gemini': {
            const apiKey = this.settings.providers.geminiApiKey;
            if (!apiKey) throw new Error('No Gemini API key configured');
            const contents = cleanMessages.map((m) => ({
              role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
              parts: [{ text: m.content }],
            }));
            text = await this.executeWithTimeout(
              callGemini({
                apiKey,
                model: modelConfig.modelString,
                systemInstruction: fullSystemPrompt,
                contents,
                temperature: this.settings.temperature,
                maxOutputTokens: this.settings.maxTokens,
              }),
              timeout
            );
            break;
          }

          case 'openai': {
            const apiKey = this.settings.providers.openaiApiKey;
            if (!apiKey) throw new Error('No OpenAI API key configured');
            const apiMessages = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            text = await this.executeWithTimeout(
              callOpenAI({
                apiKey,
                model: modelConfig.modelString,
                messages: apiMessages,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            break;
          }

          case 'anthropic': {
            const apiKey = this.settings.providers.anthropicApiKey;
            if (!apiKey) throw new Error('No Anthropic API key configured');
            const anthropicMsgs = cleanMessages
              .filter((m) => m.role !== 'system')
              .map((m) => ({
                role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
                content: m.content,
              }));
            text = await this.executeWithTimeout(
              callAnthropic({
                apiKey,
                model: modelConfig.modelString,
                system: fullSystemPrompt,
                messages: anthropicMsgs,
                temperature: this.settings.temperature,
                maxTokens: this.settings.maxTokens,
              }),
              timeout
            );
            break;
          }

          case 'ollama': {
            const baseUrl = this.settings.providers.ollamaBaseUrl || 'http://localhost:11434';
            const ollamaMsgs = [
              { role: 'system' as const, content: fullSystemPrompt },
              ...cleanMessages,
            ];
            text = await this.executeWithTimeout(
              callOllama({
                baseUrl,
                model: modelConfig.modelString,
                messages: ollamaMsgs,
                temperature: this.settings.temperature,
              }),
              timeout
            );
            break;
          }

          case 'autonomous': {
            text = AutonomousKnowledgeEngine.generateResponse({
              currentPage,
              surroundingPages,
              allConcepts,
              preferences,
              memory,
              selectedText,
              query: query || messages[messages.length - 1]?.content || '',
            });
            break;
          }

          default:
            throw new Error(`Unsupported provider: ${modelConfig.provider}`);
        }

        if (text && text.trim().length > 0) {
          attempts.push({ model: modelConfig.name, success: true });
          return {
            text,
            modelUsed: modelConfig.name,
            providerUsed: modelConfig.provider,
            fallbackCount,
            attempts,
          };
        }
      } catch (err: any) {
        attempts.push({
          model: modelConfig.name,
          error: err.message || 'Unknown error',
          success: false,
        });
        fallbackCount++;
      }
    }

    // Zero-Key Autonomous Fallback
    const fallbackText = AutonomousKnowledgeEngine.generateResponse({
      currentPage,
      surroundingPages,
      allConcepts,
      preferences,
      memory,
      selectedText,
      query: query || messages[messages.length - 1]?.content || '',
    });

    attempts.push({ model: 'Autonomous Document Knowledge Engine', success: true });
    return {
      text: fallbackText,
      modelUsed: 'Autonomous Document Knowledge Engine',
      providerUsed: 'autonomous',
      fallbackCount,
      attempts,
    };
  }

  async generateImLostDiagnosis(params: {
    currentPage: DocumentPage;
    surroundingPages: DocumentPage[];
    allConcepts: ConceptNode[];
    preferences: UserPreferences;
    memory?: DocumentMemory;
    selectedText?: string;
  }): Promise<ImLostDiagnosis> {
    const { currentPage, surroundingPages, allConcepts, preferences, memory, selectedText } = params;

    const prompt = buildImLostPrompt(
      currentPage,
      surroundingPages,
      allConcepts,
      preferences,
      memory,
      selectedText
    );

    const priorityList = this.settings.modelPriority || DEFAULT_AI_SETTINGS.modelPriority;

    for (const modelId of priorityList) {
      const modelConfig = AVAILABLE_MODELS.find((m) => m.id === modelId);
      if (!modelConfig || !modelConfig.enabled || modelConfig.provider === 'autonomous') continue;

      try {
        let rawText = '';
        const timeout = this.settings.timeoutMs || 12000;

        if (modelConfig.provider === 'mistral') {
          const res = await this.executeWithTimeout(
            callMistral({
              apiKey: this.settings.providers.mistralApiKey,
              keyPool: this.settings.providers.mistralKeyPool,
              model: modelConfig.modelString,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2,
              maxTokens: 2000,
            }),
            timeout
          );
          rawText = res.text;
        } else if (modelConfig.provider === 'groq') {
          const res = await this.executeWithTimeout(
            callGroq({
              apiKey: this.settings.providers.groqApiKey,
              keyPool: this.settings.providers.groqKeyPool,
              model: modelConfig.modelString,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2,
              maxTokens: 2000,
            }),
            timeout
          );
          rawText = res.text;
        } else if (modelConfig.provider === 'opencode') {
          const res = await this.executeWithTimeout(
            callOpenCode({
              apiKey: this.settings.providers.opencodeApiKey,
              keyPool: this.settings.providers.opencodeKeyPool,
              model: modelConfig.modelString,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2,
              maxTokens: 2000,
            }),
            timeout
          );
          rawText = res.text;
        } else if (modelConfig.provider === 'openrouter') {
          const res = await this.executeWithTimeout(
            callOpenRouter({
              apiKey: this.settings.providers.openrouterApiKey || DEFAULT_AI_SETTINGS.providers.openrouterApiKey!,
              model: modelConfig.modelString,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.2,
              maxTokens: 2000,
            }),
            timeout
          );
          rawText = res.text;
        }

        if (rawText) {
          const cleanJson = rawText.replace(/```json\s*|```/g, '').trim();
          const parsed = JSON.parse(cleanJson);
          const bridge = parsed?.bridgeExplanation || parsed?.explanation;
          if (parsed && bridge) {
            return {
              currentPage: currentPage.pageNumber,
              currentSection: currentPage.headings[0] || 'Section',
              detectedStruggle: parsed.detectedStruggle || 'Prerequisite gap detected on this page',
              missingPrerequisiteId: parsed.missingPrerequisiteId,
              missingPrerequisiteName: parsed.missingPrerequisiteName || 'Foundational Prerequisite',
              missingPrerequisitePage: parsed.missingPrerequisitePage || Math.max(1, currentPage.pageNumber - 1),
              whyItMatters: parsed.whyItMatters || `Mastering this foundation makes Page ${currentPage.pageNumber} straightforward.`,
              bridgeExplanation: bridge,
              analogyExplanation: parsed.analogyExplanation || parsed.analogy,
              visualDiagram: parsed.visualDiagram,
              quickTakeaway: parsed.quickTakeaway || 'Master the prerequisite to unlock this section.',
              stepByStepPoints: parsed.stepByStepPoints,
              understandingCheck: parsed.understandingCheck,
              returnToPage: currentPage.pageNumber,
            };
          }
        }
      } catch (err) {
        // Fallback to next provider in priority
      }
    }

    return AutonomousKnowledgeEngine.generateImLostDiagnosis({
      currentPage,
      surroundingPages,
      allConcepts,
      preferences,
      memory,
      selectedText,
    });
  }
}
