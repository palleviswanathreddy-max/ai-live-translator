/// <reference types="vite/client" />
import { ITTSProvider, TTSPlayOptions } from './TTSProvider';
import { LanguageCode } from '../../types';

export class PiperApiProvider implements ITTSProvider {
  public name = 'PiperApiProvider';
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map();
  private isLoadingState: boolean = false;
  private lastOptions: TTSPlayOptions | null = null;

  constructor() {
    this.preloadCache();
  }

  private preloadCache() {
    try {
      const stored = localStorage.getItem('mv_piper_audio_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.entries(parsed).forEach(([k, v]) => {
          this.audioCache.set(k, v as string);
        });
      }
    } catch (e) {
      console.warn("[PiperApiProvider] Failed to load local cache:", e);
    }
  }

  private saveToCache(key: string, blobUrl: string) {
    try {
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        if (firstKey) this.audioCache.delete(firstKey);
      }
      this.audioCache.set(key, blobUrl);

      const obj: Record<string, string> = {};
      this.audioCache.forEach((v, k) => { obj[k] = v; });
      localStorage.setItem('mv_piper_audio_cache', JSON.stringify(obj));
    } catch (e) {
      // Ignore storage quota
    }
  }

  public async isAvailable(lang: LanguageCode): Promise<boolean> {
    const customUrl = localStorage.getItem('mv_piper_api_url') || import.meta.env.VITE_PIPER_API_URL;
    return Boolean(customUrl || lang.startsWith('te'));
  }

  private async fetchAudioWithRetry(url: string, retries = 2, delay = 300): Promise<Response> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url);
        if (res.ok) return res;
      } catch (err) {
        if (attempt === retries) throw err;
      }
      await new Promise(r => setTimeout(r, delay * Math.pow(2, attempt)));
    }
    throw new Error("Piper API network request failed");
  }

  public async speak(options: TTSPlayOptions): Promise<boolean> {
    if (!options.text || !options.text.trim()) return false;

    this.stop();
    this.lastOptions = options;
    this.isLoadingState = true;

    const cleanText = options.text.trim();
    const langTag = options.lang.startsWith('te') ? 'te' : 'en';
    const cacheKey = `piper:${langTag}:${cleanText}`;

    console.info(`[PiperApiProvider] Requesting audio stream for lang '${langTag}': "${cleanText.slice(0, 30)}..."`);

    try {
      let audioSrc = this.audioCache.get(cacheKey);

      if (audioSrc) {
        console.info(`[PiperApiProvider] Loaded audio from memory cache for key: ${cacheKey}`);
      } else {
        const customUrl = localStorage.getItem('mv_piper_api_url') || import.meta.env.VITE_PIPER_API_URL;
        let endpointUrl: string;

        if (customUrl) {
          endpointUrl = `${customUrl.replace(/\/$/, '')}/api/tts?text=${encodeURIComponent(cleanText)}&lang=${langTag}`;
        } else {
          endpointUrl = `/api/tts?text=${encodeURIComponent(cleanText)}&lang=${langTag}`;
        }

        console.info(`[PiperApiProvider] Querying endpoint: ${endpointUrl}`);
        const response = await this.fetchAudioWithRetry(endpointUrl);
        const blob = await response.blob();

        audioSrc = URL.createObjectURL(blob);
        this.saveToCache(cacheKey, audioSrc);
      }

      const audio = new Audio(audioSrc);
      audio.playbackRate = options.settings.rate || 1.0;
      audio.volume = options.settings.volume !== undefined ? options.settings.volume : 1.0;

      this.currentAudio = audio;

      audio.onplay = () => {
        console.info("[PiperApiProvider] Audio stream playback started.");
        this.isLoadingState = false;
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        console.info("[PiperApiProvider] Audio stream playback completed.");
        this.isLoadingState = false;
        this.currentAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (err) => {
        console.warn("[PiperApiProvider] Audio stream error:", err);
        this.isLoadingState = false;
        this.currentAudio = null;
        if (options.onError) options.onError(new Error("Piper audio playback failed"));
        if (options.onEnd) options.onEnd();
      };

      await audio.play();
      return true;

    } catch (error) {
      console.warn("[PiperApiProvider] Piper TTS generation failed:", error);
      this.isLoadingState = false;
      if (options.onError) options.onError(error as Error);
      return false;
    }
  }

  public pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      console.info("[PiperApiProvider] Pausing audio stream.");
      this.currentAudio.pause();
    }
  }

  public resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      console.info("[PiperApiProvider] Resuming audio stream.");
      this.currentAudio.play().catch(e => console.warn("[PiperApiProvider] Resume failed:", e));
    }
  }

  public stop(): void {
    if (this.currentAudio) {
      console.info("[PiperApiProvider] Stopping audio stream.");
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isLoadingState = false;
  }

  public replay(): void {
    if (this.lastOptions) {
      console.info("[PiperApiProvider] Replaying audio stream.");
      this.speak(this.lastOptions);
    }
  }

  public isSpeaking(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  public isPaused(): boolean {
    return this.currentAudio !== null && this.currentAudio.paused;
  }

  public isLoading(): boolean {
    return this.isLoadingState;
  }
}
