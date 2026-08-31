import {
  AISettings,
  ChatMessage,
  DocumentPage,
  ConceptNode,
  UserPreferences,
  DocumentMemory,
  ImLostDiagnosis,
  QuickActionType,
} from '@/types';
import { AIProviderManager } from './provider-manager';

export class ClientAI {
  /**
   * Executes context-aware chat generation with automatic multi-key rotation and fallback.
   */
  static async chat(params: {
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
  }): Promise<{
    text: string;
    modelUsed: string;
    providerUsed: string;
    fallbackCount: number;
  }> {
    const manager = new AIProviderManager(params.settings);
    const result = await manager.generateChatResponse(params);
    return {
      text: result.text,
      modelUsed: result.modelUsed,
      providerUsed: result.providerUsed,
      fallbackCount: result.fallbackCount,
    };
  }

  /**
   * Executes signature "I'm Lost" diagnosis with smart recovery.
   */
  static async imLost(params: {
    currentPage: DocumentPage;
    surroundingPages?: DocumentPage[];
    allConcepts?: ConceptNode[];
    preferences: UserPreferences;
    memory?: DocumentMemory;
    selectedText?: string;
    settings?: AISettings;
  }): Promise<ImLostDiagnosis> {
    const manager = new AIProviderManager(params.settings);
    return manager.generateImLostDiagnosis({
      currentPage: params.currentPage,
      surroundingPages: params.surroundingPages || [],
      allConcepts: params.allConcepts || [],
      preferences: params.preferences,
      memory: params.memory,
      selectedText: params.selectedText,
    });
  }

  /**
   * Executes adaptive quick actions.
   */
  static async quickAction(params: {
    actionType: QuickActionType;
    currentPage: DocumentPage;
    surroundingPages?: DocumentPage[];
    allConcepts?: ConceptNode[];
    preferences: UserPreferences;
    memory?: DocumentMemory;
    selectedText?: string;
    settings?: AISettings;
  }): Promise<{
    text: string;
    modelUsed: string;
    providerUsed: string;
  }> {
    const actionPrompts: Record<QuickActionType, string> = {
      explain_simpler: `Explain the concept on Page ${params.currentPage.pageNumber} in extremely simple, intuitive terms. Avoid heavy math notation first; build intuition with a clear metaphor.`,
      give_analogy: `Provide a vivid, relatable everyday real-world analogy for the mechanism or concept described on Page ${params.currentPage.pageNumber}.`,
      real_world_example: `Give a practical, industry or real-world application of the principles on Page ${params.currentPage.pageNumber}.`,
      step_by_step: `Break down the process, calculation, or logical argument on Page ${params.currentPage.pageNumber} into clear, numbered chronological steps.`,
      visual_explanation: `Create an ASCII flow diagram or visual mental model explaining how the components interact on Page ${params.currentPage.pageNumber}.`,
      quiz_me: `Ask me 1 challenging multiple-choice question to test my deep understanding of Page ${params.currentPage.pageNumber}. Include 4 options and mark the correct one.`,
      summarize_section: `Summarize the essential takeaways of Page ${params.currentPage.pageNumber} in 3 bullet points.`,
    };

    const promptText = actionPrompts[params.actionType] || `Explain Page ${params.currentPage.pageNumber}`;

    const userMessageContent = params.selectedText
      ? `${promptText}\n\nSpecifically regarding this excerpt: "${params.selectedText}"`
      : promptText;

    const res = await this.chat({
      messages: [{ role: 'user', content: userMessageContent }],
      currentPage: params.currentPage,
      surroundingPages: params.surroundingPages,
      allConcepts: params.allConcepts,
      preferences: params.preferences,
      memory: params.memory,
      selectedText: params.selectedText,
      query: promptText,
      settings: params.settings,
    });

    return {
      text: res.text,
      modelUsed: res.modelUsed,
      providerUsed: res.providerUsed,
    };
  }

  /**
   * Generates smart, high-yield AI flashcards from the document's content.
   */
  static async generateFlashcards(params: {
    documentTitle: string;
    pageText: string;
    pageNumber: number;
    settings?: AISettings;
  }): Promise<{ term: string; definition: string; keyTakeaway?: string }[]> {
    const prompt = `You are a master educator and study expert.
Based strictly on the following study text from "${params.documentTitle}" (Page ${params.pageNumber}):
"""
${params.pageText.slice(0, 3000)}
"""

Generate 6 high-yield, smart, conceptual flashcards. Do NOT create random or trivial cards. Create rigorous, helpful flashcards that test core principles, mechanisms, and definitions.

Return STRICTLY a JSON array of objects with this format (no markdown, no backticks, just valid JSON array):
[
  {
    "term": "Concept or Question",
    "definition": "Accurate, clear, deep explanation",
    "keyTakeaway": "Practical takeaway"
  }
]`;

    try {
      const res = await this.chat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are a study tutor that outputs only valid JSON arrays.',
        settings: params.settings,
      });

      let jsonStr = res.text.trim();
      if (jsonStr.includes('[')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('['), jsonStr.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('AI Flashcards parsing warning:', err);
    }

    const lines = params.pageText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 20 && !l.startsWith('#'));

    return lines.slice(0, 5).map((line, idx) => ({
      term: `Key Takeaway ${idx + 1}`,
      definition: line,
      keyTakeaway: `Core topic from Page ${params.pageNumber}`,
    }));
  }

  /**
   * Generates smart, thought-provoking AI quizzes from the document's content.
   */
  static async generateQuiz(params: {
    documentTitle: string;
    pageText: string;
    pageNumber: number;
    settings?: AISettings;
  }): Promise<
    {
      id: number;
      conceptName: string;
      question: string;
      options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
    }[]
  > {
    const prompt = `You are an expert curriculum examiner.
Based on the following material from "${params.documentTitle}" (Page ${params.pageNumber}):
"""
${params.pageText.slice(0, 3500)}
"""

Generate 5 challenging, high-yield multiple-choice questions testing deep understanding of the concepts on this page.
Each question must have 4 options with exactly 1 correct answer, and clear, pedagogical explanations for why the correct answer is right and why the distractors are incorrect.

Return STRICTLY a JSON array of objects with this format (no markdown, no backticks, just valid JSON array):
[
  {
    "id": 1,
    "conceptName": "Key Topic",
    "question": "Question text here?",
    "options": [
      { "id": "a", "text": "Option 1", "isCorrect": true, "explanation": "Why this is correct" },
      { "id": "b", "text": "Option 2", "isCorrect": false, "explanation": "Why this is incorrect" },
      { "id": "c", "text": "Option 3", "isCorrect": false, "explanation": "Why this is incorrect" },
      { "id": "d", "text": "Option 4", "isCorrect": false, "explanation": "Why this is incorrect" }
    ]
  }
]`;

    try {
      const res = await this.chat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an exam generator that outputs only valid JSON arrays.',
        settings: params.settings,
      });

      let jsonStr = res.text.trim();
      if (jsonStr.includes('[')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('['), jsonStr.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('AI Quiz parsing warning:', err);
    }

    return [];
  }

  /**
   * Cleans a raw title string, stripping numbered prefixes, markdown symbols, and chapter labels.
   */
  static cleanTitle(raw: string, pageNumber: number): string {
    if (!raw) return `Topic ${pageNumber}`;
    let clean = raw
      .replace(/^#+\s*/, '')
      .replace(/^(\d+[\.\)\-:]\s*)+/, '')
      .replace(/^\b(chapter|section|part|page|topic)\s+\d+[\.\:\-]?\s*/i, '')
      .replace(/[*_~`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // If still starting with leading numbers or bullets, strip them
    clean = clean.replace(/^[0-9\.\-\:\)\s]+/, '').trim();

    const words = clean.split(' ');
    if (words.length > 5) {
      clean = words.slice(0, 4).join(' ');
    }
    return clean || `Topic ${pageNumber}`;
  }

  /**
   * Generates smart, concise AI titles for all pages in a document based on content.
   */
  static async generatePageTitles(params: {
    documentTitle: string;
    pages: { pageNumber: number; text: string }[];
    settings?: AISettings;
  }): Promise<{ pageNumber: number; title: string }[]> {
    const pageExcerpts = params.pages
      .map((p) => `[Page ${p.pageNumber}]\n${p.text.slice(0, 500).replace(/\n+/g, ' ')}`)
      .join('\n\n');

    const prompt = `You are an expert curriculum designer and document indexer.
For each page of the document "${params.documentTitle}", read the excerpt and generate a crisp, concise, descriptive topic title (2 to 4 words max) summarizing the specific subject taught on that page.

CRITICAL RULES:
- Do NOT include numbers, bullet prefixes, or chapter labels (e.g. do NOT write "1.", "Section 2", "10.", "P.1").
- Capture the primary concept or subject on that page.
- Keep each title between 2 and 4 words.

Return strictly a JSON array of objects with this exact format:
[
  { "pageNumber": 1, "title": "Concise Topic Name" }
]`;

    try {
      const res = await this.chat({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are a document indexer that outputs only valid JSON arrays.',
        settings: params.settings,
      });

      let jsonStr = res.text.trim();
      if (jsonStr.includes('[')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('['), jsonStr.lastIndexOf(']') + 1);
      }
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          pageNumber: Number(item.pageNumber),
          title: this.cleanTitle(String(item.title || `Page ${item.pageNumber}`), Number(item.pageNumber)),
        }));
      }
    } catch (err) {
      console.warn('AI Page titles generation fallback:', err);
    }

    // Heuristic Fallback: Extract and clean the best leading line or heading from each page
    return params.pages.map((p) => {
      const lines = p.text.split('\n').map((l) => l.trim()).filter((l) => l.length > 3);
      const headingLine = lines.find((l) => /^#{1,3}\s+/.test(l))?.replace(/^#+\s*/, '');
      const boldCandidate = p.text.match(/\*\*([^*]{3,40})\*\*/)?.[1];
      const leadingLine = lines[0]?.replace(/^[#\*\-0-9\.\s]+/, '').slice(0, 40);

      const rawTitle = headingLine || boldCandidate || leadingLine || `Topic ${p.pageNumber}`;
      const title = this.cleanTitle(rawTitle, p.pageNumber);
      return { pageNumber: p.pageNumber, title };
    });
  }
}

