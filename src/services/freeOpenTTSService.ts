import { VoiceSettings, LanguageCode } from '../types';
import { getTTSProviderConfig } from './ttsProvider';

export class FreeOpenTTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  private isLoadingAudio: boolean = false;
  private currentText: string = '';
  private currentLang: LanguageCode = 'en-US';
  private currentSettings: VoiceSettings | null = null;
  private currentOnEnd?: () => void;
  private loadingListeners: Set<(loading: boolean) => void> = new Set();

  constructor() {
    this.preloadStoredCache();
  }

  private preloadStoredCache() {
    try {
      const stored = localStorage.getItem('mv_tts_audio_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([k, v]) => {
          this.audioCache.set(k, v as string);
        });
      }
    } catch (e) {
      console.warn("[FreeOpenTTS] Failed to load local audio cache:", e);
    }
  }

  private saveToStoredCache(key: string, dataUrl: string) {
    try {
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        if (firstKey) this.audioCache.delete(firstKey);
      }
      this.audioCache.set(key, dataUrl);
      
      const obj: Record<string, string> = {};
      this.audioCache.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem('mv_tts_audio_cache', JSON.stringify(obj));
    } catch (e) {
      // Ignore quota exceeded
    }
  }

  public subscribeLoading(listener: (loading: boolean) => void): () => void {
    this.loadingListeners.add(listener);
    listener(this.isLoadingAudio);
    return () => {
      this.loadingListeners.delete(listener);
    };
  }

  private setLoading(loading: boolean) {
    this.isLoadingAudio = loading;
    this.loadingListeners.forEach(fn => fn(loading));
  }

  public async speak(
    text: string,
    lang: LanguageCode,
    settings: VoiceSettings,
    onEnd?: () => void
  ): Promise<boolean> {
    if (!text || !text.trim()) return false;

    this.stop();

    const cleanText = text.trim();
    this.currentText = cleanText;
    this.currentLang = lang;
    this.currentSettings = settings;
    this.currentOnEnd = onEnd;

    const config = getTTSProviderConfig();
    const langTag = lang.startsWith('te') ? 'te' : 'en';
    const cacheKey = `${langTag}:${cleanText}`;

    console.info(`[FreeOpenTTS] Speech attempt for lang '${langTag}': "${cleanText.slice(0, 30)}..."`);

    this.setLoading(true);

    try {
      let audioSrc: string | undefined = this.audioCache.get(cacheKey);

      if (audioSrc) {
        console.info(`[FreeOpenTTS] Loaded audio from local cache for key: ${cacheKey}`);
      } else {
        let streamUrl: string;

        if (config.effectiveProvider === 'piper_external' && config.externalPiperUrl) {
          streamUrl = `${config.externalPiperUrl.replace(/\/$/, '')}/api/tts?text=${encodeURIComponent(cleanText)}&lang=${langTag}`;
          console.info(`[FreeOpenTTS] Requesting audio stream from External Piper endpoint: ${streamUrl}`);
        } else {
          streamUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${langTag}`;
          console.info(`[FreeOpenTTS] Requesting audio stream from local proxy endpoint: ${streamUrl}`);
        }

        const res = await fetch(streamUrl);
        if (!res.ok) {
          throw new Error(`External TTS endpoint returned status ${res.status}`);
        }

        const blob = await res.blob();
        audioSrc = URL.createObjectURL(blob);
        this.saveToStoredCache(cacheKey, audioSrc);
      }

      const audio = new Audio(audioSrc);
      audio.playbackRate = settings.rate || 1.0;
      audio.volume = settings.volume !== undefined ? settings.volume : 1.0;

      this.currentAudio = audio;

      audio.oncanplaythrough = () => {
        this.setLoading(false);
      };

      audio.onplay = () => {
        console.info("[FreeOpenTTS] Audio playback started successfully.");
        this.setLoading(false);
      };

      audio.onended = () => {
        console.info("[FreeOpenTTS] Audio playback completed.");
        this.setLoading(false);
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      audio.onerror = (err) => {
        console.warn("[FreeOpenTTS] Audio playback error:", err);
        this.setLoading(false);
        this.currentAudio = null;
        if (onEnd) onEnd();
      };

      await audio.play();
      return true;

    } catch (error) {
      console.warn("[FreeOpenTTS] External TTS audio fetch/playback failed:", error);
      this.setLoading(false);
      if (onEnd) onEnd();
      return false;
    }
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      console.info("[FreeOpenTTS] Pausing audio playback.");
      this.currentAudio.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      console.info("[FreeOpenTTS] Resuming audio playback.");
      this.currentAudio.play().catch(e => console.warn("[FreeOpenTTS] Resume failed:", e));
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      console.info("[FreeOpenTTS] Stopping audio playback.");
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.setLoading(false);
  }

  public replay(): void {
    if (this.currentText && this.currentSettings) {
      console.info("[FreeOpenTTS] Replaying audio.");
      this.speak(this.currentText, this.currentLang, this.currentSettings, this.currentOnEnd);
    }
  }

  public isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  public isPaused(): boolean {
    return this.currentAudio !== null && this.currentAudio.paused;
  }

  public isLoading(): boolean {
    return this.isLoadingAudio;
  }
}

export const freeOpenTTS = new FreeOpenTTSService();
