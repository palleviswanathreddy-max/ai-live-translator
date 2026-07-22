import { VoiceSettings, LanguageCode } from '../types';
import { piperTTS } from './piperTTSService';

export interface VoiceSelectionResult {
  voice?: SpeechSynthesisVoice;
  isFallback: boolean;
  notice?: string;
  isTeluguNative: boolean;
}

export class SpeechSynthesisService {
  private currentText: string = '';
  private currentLang: LanguageCode = 'en-US';
  private currentSettings: VoiceSettings | null = null;
  private currentOnEnd?: () => void;

  constructor() {
    console.info("[SpeechSynthesisService] Initialized with Piper Offline Engine (te_IN-padmavathi-medium ONNX model). Zero browser SpeechSynthesis dependency.");
  }

  public ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    return Promise.resolve(this.getVoices());
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return [
      {
        voiceURI: 'piper-te_IN-padmavathi-medium',
        name: 'Piper Telugu (Padmavathi Medium ONNX)',
        lang: 'te-IN',
        localService: true,
        default: true
      } as SpeechSynthesisVoice,
      {
        voiceURI: 'piper-en_US-natural-medium',
        name: 'Piper English (US Medium ONNX)',
        lang: 'en-US',
        localService: true,
        default: false
      } as SpeechSynthesisVoice
    ];
  }

  public getSelectedVoiceURI(): string | null {
    return 'piper-te_IN-padmavathi-medium';
  }

  public setSelectedVoiceURI(_uri: string | null): void {
    // Piper engine handles offline ONNX voice selection
  }

  public selectBestVoice(lang: LanguageCode, _settings: VoiceSettings): VoiceSelectionResult {
    const isTe = lang.startsWith('te');
    return {
      voice: this.getVoices()[isTe ? 0 : 1],
      isFallback: false,
      isTeluguNative: isTe,
      notice: isTe ? "Using Offline Piper Telugu Engine (te_IN-padmavathi-medium)" : "Using Offline Piper English Engine"
    };
  }

  public speak(
    text: string,
    lang: LanguageCode,
    settings: VoiceSettings,
    onEnd?: () => void,
    onNotice?: (msg: string) => void
  ): boolean {
    if (!text || !text.trim()) return false;

    const cleanText = text.trim();
    this.currentText = cleanText;
    this.currentLang = lang;
    this.currentSettings = settings;
    this.currentOnEnd = onEnd;

    const isTe = lang.startsWith('te');
    if (onNotice) {
      onNotice(isTe ? "Using Offline Piper Telugu Voice Model" : "Using Offline Piper English Engine");
    }

    console.info(`[SpeechSynthesisService] Delegating speak request to Piper TTS engine for lang '${lang}'...`);

    piperTTS.speak({
      text: cleanText,
      lang,
      settings,
      onEnd,
      onError: (err) => {
        console.warn("[SpeechSynthesisService] Piper TTS execution error:", err);
      }
    });

    return true;
  }

  public pause(): void {
    console.info("[SpeechSynthesisService] Pause requested.");
    piperTTS.pause();
  }

  public resume(): void {
    console.info("[SpeechSynthesisService] Resume requested.");
    piperTTS.resume();
  }

  public stop(): void {
    console.info("[SpeechSynthesisService] Stop requested.");
    piperTTS.stop();
  }

  public replay(): void {
    console.info("[SpeechSynthesisService] Replay requested.");
    piperTTS.replay();
  }

  public isSpeaking(): boolean {
    return piperTTS.isSpeaking();
  }

  public isPaused(): boolean {
    return piperTTS.isPaused();
  }

  public isLoading(): boolean {
    return piperTTS.isLoading();
  }
}

export const speechSpeaker = new SpeechSynthesisService();
