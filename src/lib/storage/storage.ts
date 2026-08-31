import {
  DocumentData,
  StudySession,
  UserPreferences,
  AISettings,
  UserProfile,
} from '@/types';
import { DEFAULT_AI_SETTINGS } from '../ai/default-config';
import { SAMPLE_DOCUMENTS } from '../document/sample-documents';
import { PDFStore } from './pdf-store';

const STORAGE_KEYS = {
  PREFERENCES: 'study_navigator_preferences_v2',
  SETTINGS: 'study_navigator_ai_settings_v2',
  SESSIONS: 'study_navigator_sessions_v2',
  CUSTOM_DOCS: 'study_navigator_custom_docs_v2',
  DELETED_SAMPLE_IDS: 'study_navigator_deleted_samples_v2',
  ACTIVE_SESSION: 'study_navigator_active_session_v2',
  USER_PROFILE: 'study_navigator_user_profile_v2',
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  explanationStyle: 'intuitive',
  difficultyLevel: 'intermediate',
  responseLength: 'balanced',
  visualPreference: 'visual_first',
  autoPromptUnderstandingCheck: true,
  readingMode: 'continuous_scroll',
  ttsRate: 1.0,
  ttsPitch: 1.0,
  username: 'Alex',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  username: 'Alex',
  displayName: 'Alex Student',
  createdAt: new Date().toISOString(),
};

export class StorageManager {
  /**
   * Loads user profile / auth state
   */
  static getUserProfile(): UserProfile {
    if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? { ...DEFAULT_USER_PROFILE, ...JSON.parse(data) } : DEFAULT_USER_PROFILE;
    } catch {
      return DEFAULT_USER_PROFILE;
    }
  }

  static saveUserProfile(profile: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      // Sync username with preferences
      const prefs = this.getPreferences();
      this.savePreferences({ ...prefs, username: profile.username });
    } catch (e) {
      console.error('Failed to save user profile:', e);
    }
  }

  /**
   * Loads user preferences from localStorage.
   */
  static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_USER_PREFERENCES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(data) } : DEFAULT_USER_PREFERENCES;
    } catch {
      return DEFAULT_USER_PREFERENCES;
    }
  }

  static savePreferences(prefs: UserPreferences): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save preferences:', e);
    }
  }

  /**
   * Loads AI settings (keys, priorities).
   */
  static getAISettings(): AISettings {
    if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_AI_SETTINGS;
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_AI_SETTINGS,
        ...parsed,
        providers: {
          ...DEFAULT_AI_SETTINGS.providers,
          ...(parsed.providers || {}),
          mistralKeyPool: DEFAULT_AI_SETTINGS.providers.mistralKeyPool,
          groqKeyPool: DEFAULT_AI_SETTINGS.providers.groqKeyPool,
          opencodeKeyPool: DEFAULT_AI_SETTINGS.providers.opencodeKeyPool,
        },
        modelPriority: DEFAULT_AI_SETTINGS.modelPriority,
      };
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  }

  static saveAISettings(settings: AISettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  }

  /**
   * Loads all documents (samples + custom), strictly deduplicated.
   */
  static getAllDocuments(): DocumentData[] {
    if (typeof window === 'undefined') return SAMPLE_DOCUMENTS;
    try {
      const customDocs = this.getCustomDocuments();
      const combined = [...SAMPLE_DOCUMENTS, ...customDocs];
      const seenIds = new Set<string>();
      const seenTitles = new Set<string>();
      const result: DocumentData[] = [];

      for (const doc of combined) {
        const normTitle = doc.title.toLowerCase().trim();
        if (!seenIds.has(doc.id) && !seenTitles.has(normTitle)) {
          seenIds.add(doc.id);
          seenTitles.add(normTitle);
          result.push(doc);
        }
      }

      return result;
    } catch {
      return SAMPLE_DOCUMENTS;
    }
  }

  static getCustomDocuments(): DocumentData[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DOCS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearCustomDocuments(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_DOCS);
    } catch (e) {
      console.error('Failed to clear custom docs:', e);
    }
  }

  static saveCustomDocument(doc: DocumentData): void {
    if (typeof window === 'undefined') return;
    try {
      // Strip out huge base64 data to avoid exceeding localStorage quota
      const { pdfDataUrl, ...docToSave } = doc;
      const current = this.getCustomDocuments();
      // Remove any existing with same id or title to prevent duplication
      const filtered = current.filter(
        (d) => d.id !== doc.id && d.title.toLowerCase().trim() !== doc.title.toLowerCase().trim()
      );
      const updated = [docToSave as DocumentData, ...filtered];
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DOCS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save custom doc:', e);
    }
  }

  static deleteDocument(docId: string): void {
    if (typeof window === 'undefined') return;
    try {
      // 1. Remove from custom docs
      const custom = this.getCustomDocuments().filter((d) => d.id !== docId);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DOCS, JSON.stringify(custom));

      // 2. If it has a PDF stored in IndexedDB, delete it
      PDFStore.deletePDF(docId).catch(() => {});

      // 3. If it's a sample doc, track in deletedSampleIds
      const isSample = SAMPLE_DOCUMENTS.some((s) => s.id === docId);
      if (isSample) {
        const deletedSampleIds: string[] = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.DELETED_SAMPLE_IDS) || '[]'
        );
        if (!deletedSampleIds.includes(docId)) {
          deletedSampleIds.push(docId);
          localStorage.setItem(STORAGE_KEYS.DELETED_SAMPLE_IDS, JSON.stringify(deletedSampleIds));
        }
      }

      // 4. Also delete associated sessions
      const sessions = this.getAllSessions().filter((s) => s.documentId !== docId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete document:', e);
    }
  }

  /**
   * Sessions management.
   */
  static getAllSessions(): StudySession[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static getSessionById(id: string): StudySession | null {
    const sessions = this.getAllSessions();
    return sessions.find((s) => s.id === id) || null;
  }

  static saveSession(session: StudySession): void {
    if (typeof window === 'undefined') return;
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter((s) => s.id !== session.id);
      const updated = [session, ...filtered];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, session.id);
    } catch (e) {
      console.error('Failed to save session:', e);
    }
  }

  static createNewSession(doc: DocumentData, preferences: UserPreferences): StudySession {
    const userGreeting = preferences.username ? `Hi **${preferences.username}**! ` : '';
    const session: StudySession = {
      id: `session-${Date.now()}`,
      documentId: doc.id,
      title: `${doc.title.slice(0, 32)}... Study Session`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      userPreferences: preferences,
      messages: [],
      memory: {
        visitedPages: [1],
        currentPage: 1,
        masteredConceptIds: doc.conceptGraph.concepts.slice(0, 1).map((c) => c.id),
        strugglingConceptIds: [],
        questionCount: 0,
        imLostTriggerCount: 0,
        lastActiveTimestamp: new Date().toISOString(),
        notes: [],
        bookmarks: [],
      },
      totalStudySeconds: 0,
    };

    this.saveSession(session);
    return session;
  }

  static deleteSession(sessionId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const sessions = this.getAllSessions().filter((s) => s.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  }
}
