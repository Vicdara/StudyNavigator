/**
 * Text-to-Speech (TTS) Engine using native browser Web Speech API.
 * Designed to execute synchronously within user click events to preserve browser gesture tokens.
 */

export interface TTSOptions {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export class SpeechManager {
  private static synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private static currentUtterance: SpeechSynthesisUtterance | null = null;
  private static cachedVoices: SpeechSynthesisVoice[] = [];
  private static isCurrentlyPlaying: boolean = false;
  private static isInitialized: boolean = false;

  static {
    // Eagerly initialize and cache voices on load
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const load = () => {
          const v = window.speechSynthesis.getVoices();
          if (v && v.length > 0) {
            SpeechManager.cachedVoices = v;
          }
        };
        load();
        window.speechSynthesis.addEventListener('voiceschanged', load);
      } catch (e) {
        console.warn('Voices initialization note:', e);
      }
    }
  }

  /**
   * Cleans text before speaking (removes markdown, LaTeX, table markers, URLs).
   */
  static sanitizeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/```[\s\S]*?```/g, ' Code snippet omitted. ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^[-*•]\s+/gm, '')
      .replace(/^\d+[\.\)]\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\$\$?[^$]+\$\$?/g, ' mathematical formula ')
      .replace(/\|[^\n]+\|/g, ' ')
      .replace(/https?:\/\/\S+/g, ' link ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits text into short natural sentence chunks to bypass browser speech truncation.
   */
  private static chunkText(text: string): string[] {
    const rawSentences = text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
    const chunks: string[] = [];
    let current = '';

    for (const s of rawSentences) {
      const sentence = s.trim();
      if (!sentence) continue;

      if ((current + ' ' + sentence).length < 180) {
        current = current ? current + ' ' + sentence : sentence;
      } else {
        if (current) chunks.push(current);
        current = sentence;
      }
    }
    if (current) chunks.push(current);
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Synchronously retrieves voices from memory cache or instant API call.
   */
  static getVoicesSync(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.cachedVoices.length > 0) return this.cachedVoices;
    const v = this.synth.getVoices();
    if (v && v.length > 0) {
      this.cachedVoices = v;
      return v;
    }
    return [];
  }

  /**
   * Async helper for Settings modal voice list dropdown.
   */
  static async getVoices(): Promise<SpeechSynthesisVoice[]> {
    const sync = this.getVoicesSync();
    if (sync.length > 0) return sync;

    return new Promise((resolve) => {
      if (!this.synth) return resolve([]);
      const onVoicesChanged = () => {
        const voices = this.synth?.getVoices() || [];
        this.cachedVoices = voices;
        if (this.synth) {
          this.synth.removeEventListener('voiceschanged', onVoicesChanged);
        }
        resolve(voices);
      };

      this.synth.addEventListener('voiceschanged', onVoicesChanged);
      setTimeout(() => {
        resolve(this.synth?.getVoices() || []);
      }, 300);
    });
  }

  /**
   * Speaks the provided text synchronously within the user event loop.
   */
  static speak(text: string, options: TTSOptions = {}): void {
    if (!this.synth) {
      if (options.onError) options.onError(new Error('Speech Synthesis not supported.'));
      return;
    }

    this.stop();

    const clean = this.sanitizeText(text);
    if (!clean) {
      if (options.onEnd) options.onEnd();
      return;
    }

    const chunks = this.chunkText(clean);
    const voices = this.getVoicesSync();

    let selectedVoice: SpeechSynthesisVoice | undefined;
    if (options.voiceName) {
      selectedVoice = voices.find((v) => v.name === options.voiceName || v.voiceURI === options.voiceName);
    }
    if (!selectedVoice && voices.length > 0) {
      selectedVoice =
        voices.find(
          (v) =>
            (v.name.includes('Google') ||
              v.name.includes('Natural') ||
              v.name.includes('Neural') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Guy')) &&
            v.lang.startsWith('en')
        ) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
    }

    this.isCurrentlyPlaying = true;
    if (options.onStart) options.onStart();

    // Unpause synthesis context
    if (this.synth.paused) {
      this.synth.resume();
    }

    let currentIndex = 0;

    const playNext = () => {
      if (!this.synth || !this.isCurrentlyPlaying || currentIndex >= chunks.length) {
        this.isCurrentlyPlaying = false;
        this.currentUtterance = null;
        if (options.onEnd) options.onEnd();
        return;
      }

      const chunk = chunks[currentIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      if (selectedVoice) utterance.voice = selectedVoice;

      utterance.onend = () => {
        currentIndex++;
        playNext();
      };

      utterance.onerror = (e: any) => {
        if (e.error === 'canceled' || e.error === 'interrupted') {
          this.isCurrentlyPlaying = false;
          return;
        }
        currentIndex++;
        if (currentIndex < chunks.length) {
          playNext();
        } else {
          this.isCurrentlyPlaying = false;
          this.currentUtterance = null;
          if (options.onError) options.onError(e);
        }
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    };

    // Trigger immediately in same execution turn
    playNext();
  }

  static stop(): void {
    if (!this.synth) return;
    this.isCurrentlyPlaying = false;
    this.currentUtterance = null;
    this.synth.cancel();
  }

  static pause(): void {
    if (!this.synth) return;
    this.synth.pause();
  }

  static resume(): void {
    if (!this.synth) return;
    this.synth.resume();
  }

  static isSpeaking(): boolean {
    if (!this.synth) return false;
    return this.synth.speaking || this.isCurrentlyPlaying;
  }
}
