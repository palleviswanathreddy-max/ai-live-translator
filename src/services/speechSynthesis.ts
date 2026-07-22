import { VoiceSettings, LanguageCode } from '../types';

export interface VoiceSelectionResult {
  voice?: SpeechSynthesisVoice;
  isFallback: boolean;
  notice?: string;
  isTeluguNative: boolean;
}

const CUSTOM_VOICE_STORAGE_KEY = 'mv_selected_voice_URI';

export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoadedPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices(): SpeechSynthesisVoice[] {
    if (this.synth) {
      const list = this.synth.getVoices();
      if (list && list.length > 0) {
        this.voices = list;
      }
    }
    return this.voices;
  }

  public ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    if (this.voices.length > 0) {
      return Promise.resolve(this.voices);
    }

    if (this.voicesLoadedPromise) {
      return this.voicesLoadedPromise;
    }

    this.voicesLoadedPromise = new Promise((resolve) => {
      let done = false;

      const check = () => {
        const list = this.getVoices();
        if (list.length > 0 && !done) {
          done = true;
          resolve(list);
        }
      };

      check();

      if (!done && this.synth) {
        this.synth.onvoiceschanged = () => {
          check();
        };
      }

      // Timeout safety after 1000ms
      setTimeout(() => {
        if (!done) {
          done = true;
          resolve(this.getVoices());
        }
      }, 1000);
    });

    return this.voicesLoadedPromise;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    this.loadVoices();
    return this.voices;
  }

  public getSelectedVoiceURI(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(CUSTOM_VOICE_STORAGE_KEY);
  }

  public setSelectedVoiceURI(uri: string | null): void {
    if (typeof window === 'undefined') return;
    if (uri) {
      localStorage.setItem(CUSTOM_VOICE_STORAGE_KEY, uri);
    } else {
      localStorage.removeItem(CUSTOM_VOICE_STORAGE_KEY);
    }
  }

  public selectBestVoice(lang: LanguageCode, settings: VoiceSettings): VoiceSelectionResult {
    const available = this.getVoices();
    const customURI = this.getSelectedVoiceURI();
    const isTelugu = lang.startsWith('te');

    // 1. Check if user manually selected a custom voice URI from localStorage
    if (customURI && available.length > 0) {
      const customMatch = available.find(v => v.voiceURI === customURI);
      if (customMatch) {
        const isTe = customMatch.lang.startsWith('te') || customMatch.name.toLowerCase().includes('telugu');
        return {
          voice: customMatch,
          isFallback: !isTe && isTelugu,
          isTeluguNative: isTe,
          notice: isTe ? undefined : `Using manually selected voice: ${customMatch.name} (${customMatch.lang})`
        };
      }
    }

    if (isTelugu) {
      // 2. Direct Native Telugu voice match (te-IN, te_IN, te, or name containing "Telugu"/"తెలుగు")
      const teVoice = available.find(
        v => v.lang === 'te-IN' ||
             v.lang === 'te_IN' ||
             v.lang.startsWith('te') ||
             v.name.toLowerCase().includes('telugu') ||
             v.name.toLowerCase().includes('te-in')
      );

      if (teVoice) {
        return { voice: teVoice, isFallback: false, isTeluguNative: true };
      }

      // 3. Indian Accent Fallback (hi-IN, en-IN, ta-IN, etc.)
      const inVoice = available.find(
        v => v.lang === 'hi-IN' ||
             v.lang.startsWith('hi') ||
             v.lang === 'en-IN' ||
             v.lang.endsWith('-IN') ||
             v.lang.endsWith('_IN') ||
             v.name.toLowerCase().includes('india')
      );

      if (inVoice) {
        return {
          voice: inVoice,
          isFallback: true,
          isTeluguNative: false,
          notice: `Native Telugu voice pack is not installed in your OS/Browser. Using Indian voice (${inVoice.name}) for audio output.`
        };
      }

      // 4. System Default Fallback
      const defaultVoice = available.find(v => v.default) || available[0];
      return {
        voice: defaultVoice,
        isFallback: true,
        isTeluguNative: false,
        notice: "Native Telugu voice pack is not installed in your OS/Browser. Please install a Telugu voice pack or select a custom voice in Voice Diagnostics."
      };
    }

    // English Voice Selection
    let enVoice: SpeechSynthesisVoice | undefined;

    if (settings.voiceGender && available.length > 0) {
      enVoice = available.find(v => {
        const name = v.name.toLowerCase();
        const matchesLang = v.lang.startsWith('en');
        if (!matchesLang) return false;
        if (settings.voiceGender === 'female') {
          return name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('google') || name.includes('victoria');
        } else {
          return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('alex');
        }
      });
    }

    if (!enVoice) {
      enVoice = available.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || available[0];
    }

    return { voice: enVoice, isFallback: false, isTeluguNative: false };
  }

  public async speak(
    text: string,
    lang: LanguageCode,
    settings: VoiceSettings,
    onEnd?: () => void,
    onNotice?: (msg: string) => void
  ): Promise<boolean> {
    if (!this.synth) return false;

    // Reset ongoing speech
    this.synth.cancel();

    if (!text.trim()) return false;

    // Ensure voices list is fully loaded before voice selection
    await this.ensureVoicesLoaded();

    const selection = this.selectBestVoice(lang, settings);

    if (selection.notice && onNotice) {
      onNotice(selection.notice);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.rate || 1.0;
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;

    const isTelugu = lang.startsWith('te');

    if (selection.voice) {
      utterance.voice = selection.voice;
      utterance.lang = selection.voice.lang || (isTelugu ? 'te-IN' : 'en-US');
    } else {
      utterance.lang = isTelugu ? 'te-IN' : 'en-US';
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      if (onEnd) onEnd();
    };

    // Android/Chrome 50ms delay after cancel to ensure speech triggers reliably
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 50);

    return true;
  }

  public pause(): void {
    if (this.synth) this.synth.pause();
  }

  public resume(): void {
    if (this.synth) this.synth.resume();
  }

  public stop(): void {
    if (this.synth) this.synth.cancel();
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const speechSpeaker = new SpeechSynthesisService();
