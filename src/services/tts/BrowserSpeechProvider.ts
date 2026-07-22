import { ITTSProvider, TTSPlayOptions } from './TTSProvider';
import { LanguageCode, VoiceSettings } from '../../types';

export class BrowserSpeechProvider implements ITTSProvider {
  public name = 'BrowserSpeechProvider';
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private lastOptions: TTSPlayOptions | null = null;

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

  public getVoices(): SpeechSynthesisVoice[] {
    this.loadVoices();
    return this.voices;
  }

  public async isAvailable(lang: LanguageCode): Promise<boolean> {
    if (!this.synth) return false;
    this.loadVoices();

    const isTelugu = lang.startsWith('te');
    if (isTelugu) {
      const teVoice = this.voices.find(
        v => v.lang === 'te-IN' || v.lang === 'te_IN' || v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
      );
      return Boolean(teVoice);
    }

    // English or other languages
    const enVoice = this.voices.find(v => v.lang.startsWith('en') || v.lang === 'en-US');
    return Boolean(enVoice || this.voices.length > 0);
  }

  public selectBestVoice(lang: LanguageCode, settings: VoiceSettings): SpeechSynthesisVoice | undefined {
    this.loadVoices();
    const isTelugu = lang.startsWith('te');

    if (isTelugu) {
      return this.voices.find(
        v => v.lang === 'te-IN' || v.lang === 'te_IN' || v.lang.startsWith('te') || v.name.toLowerCase().includes('telugu')
      );
    }

    // English Voice selection matching gender preference
    if (settings.voiceGender && this.voices.length > 0) {
      const match = this.voices.find(v => {
        const name = v.name.toLowerCase();
        const matchesLang = v.lang.startsWith('en');
        if (!matchesLang) return false;
        if (settings.voiceGender === 'female') {
          return name.includes('female') || name.includes('zira') || name.includes('samantha') || name.includes('victoria') || name.includes('google');
        } else {
          return name.includes('male') || name.includes('david') || name.includes('george') || name.includes('alex');
        }
      });

      if (match) return match;
    }

    return this.voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || this.voices[0];
  }

  public async speak(options: TTSPlayOptions): Promise<boolean> {
    if (!this.synth) return false;
    if (!options.text || !options.text.trim()) return false;

    this.stop();
    this.lastOptions = options;

    const selectedVoice = this.selectBestVoice(options.lang, options.settings);
    const isTelugu = options.lang.startsWith('te');

    if (isTelugu && !selectedVoice) {
      console.warn("[BrowserSpeechProvider] No native te-IN browser voice found.");
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(options.text.trim());
    utterance.rate = options.settings.rate || 1.0;
    utterance.pitch = options.settings.pitch || 1.0;
    utterance.volume = options.settings.volume !== undefined ? options.settings.volume : 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || (isTelugu ? 'te-IN' : 'en-US');
      console.info(`[BrowserSpeechProvider] Speaking with voice "${selectedVoice.name}" (${utterance.lang})`);
    } else {
      utterance.lang = isTelugu ? 'te-IN' : 'en-US';
      console.info(`[BrowserSpeechProvider] Speaking with default browser voice (${utterance.lang})`);
    }

    utterance.onstart = () => {
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      console.info("[BrowserSpeechProvider] Playback completed.");
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("[BrowserSpeechProvider] Utterance error:", e);
      if (options.onError) options.onError(new Error(e.error || "Speech synthesis failed"));
      if (options.onEnd) options.onEnd();
    };

    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 50);

    return true;
  }

  public pause(): void {
    if (this.synth && this.synth.speaking) {
      console.info("[BrowserSpeechProvider] Pausing speech.");
      this.synth.pause();
    }
  }

  public resume(): void {
    if (this.synth && this.synth.paused) {
      console.info("[BrowserSpeechProvider] Resuming speech.");
      this.synth.resume();
    }
  }

  public stop(): void {
    if (this.synth) {
      console.info("[BrowserSpeechProvider] Stopping speech.");
      this.synth.cancel();
    }
  }

  public replay(): void {
    if (this.lastOptions) {
      console.info("[BrowserSpeechProvider] Replaying last speech.");
      this.speak(this.lastOptions);
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }
}
