/// <reference types="vite/client" />
import { VoiceSettings, LanguageCode } from '../types';
import { CONFIG, getTtsEndpointUrl } from '../config';
import { httpClient } from '../utils/httpClient';

export interface PiperSpeakOptions {
  text: string;
  lang: LanguageCode;
  settings: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

export class PiperTTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;
  private audioCache: Map<string, ArrayBuffer> = new Map();
  private decodedCache: Map<string, AudioBuffer> = new Map();
  private currentRequestKey: string | null = null;
  private isProcessingQueue: boolean = false;
  private speechQueue: PiperSpeakOptions[] = [];
  private currentOptions: PiperSpeakOptions | null = null;
  private loadingListeners: Set<(loading: boolean) => void> = new Set();
  private isLoadingAudio: boolean = false;
  private activeAbortController: AbortController | null = null;
  private activeBlobUrl: string | null = null;
  private inflightFetchMap: Map<string, Promise<ArrayBuffer>> = new Map();

  constructor() {
    this.initAudioContext();
    this.setupAutoplayUnlock();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !this.audioContext) {
        this.audioContext = new AudioCtx();
        console.info(`[PiperTTS] AudioContext initialized. State: ${this.audioContext.state}`);
      }
    }
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.info(`[PiperTTS] AudioContext resumed by user gesture. State: ${this.audioContext?.state}`);
        }).catch(e => console.warn("[PiperTTS] AudioContext unlock resume failed:", e));
      }

      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    window.addEventListener('keydown', unlock);
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

  /**
   * Aborts active network fetches, stops current audio playback, and cleans up blob URLs.
   */
  public stop(): void {
    if (this.activeAbortController) {
      this.activeAbortController.abort('Playback stopped by user');
      this.activeAbortController = null;
    }

    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.onended = null;
        this.currentSourceNode.stop();
      } catch (e) {
        // Ignore stop on stopped node
      }
      this.currentSourceNode = null;
    }

    if (this.currentAudio) {
      this.currentAudio.onplay = null;
      this.currentAudio.onended = null;
      this.currentAudio.onerror = null;
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }

    if (this.activeBlobUrl) {
      URL.revokeObjectURL(this.activeBlobUrl);
      this.activeBlobUrl = null;
    }

    this.speechQueue = [];
    this.isProcessingQueue = false;
    this.currentRequestKey = null;
    this.currentOptions = null;
    this.setLoading(false);
  }
  public async speak(options: PiperSpeakOptions): Promise<boolean> {

    if (!options.text || !options.text.trim()) return false;

    const cleanText = options.text.trim();

    // Ignore duplicate active speech
    if (
      this.currentOptions &&
      this.currentOptions.text.trim() === cleanText &&
      this.isSpeaking()
    ) {
      console.info("[PiperTTS] Duplicate speech ignored");
      return true;
    }


    // Stop only previous different speech
    if (
      this.isSpeaking() &&
      this.currentOptions &&
      this.currentOptions.text.trim() !== cleanText
    ) {
      console.info("[PiperTTS] stopping previous speech");
      this.stop();
    }

    const requestStart = performance.now();
    const langTag = options.lang.startsWith('te') ? 'te' : 'en';
    const cacheKey = `piper_buf:${langTag}:${cleanText.toLowerCase()}`;
    if (this.currentRequestKey === cacheKey) {
      console.info("[PiperTTS] Duplicate request ignored:", cacheKey);
      return false;
    }
    this.currentRequestKey = cacheKey;

    console.info(`[PiperTTS] Speak request for lang '${langTag}': "${cleanText.slice(0, 35)}..."`);

    this.setLoading(true);
    this.currentOptions = options;

    this.activeAbortController = new AbortController();
    const signal = this.activeAbortController.signal;

    try {
      let arrayBuffer: ArrayBuffer | undefined = this.audioCache.get(cacheKey);

      if (arrayBuffer) {
        console.info(`[PiperTTS Telemetry] ⚡ Instant RAM cache hit for key: ${cacheKey}`);
      } else if (this.inflightFetchMap.has(cacheKey)) {
        console.info(`[PiperTTS Telemetry] 🔄 Deduplicating in-flight fetch for key: ${cacheKey}`);
        arrayBuffer = await this.inflightFetchMap.get(cacheKey)!;
      } else {
        const fetchPromise = (async () => {
          const payload = { text: cleanText, lang: langTag };
          const primaryUrl = getTtsEndpointUrl();

          let res: Response;
          try {
            res = await httpClient.post(primaryUrl, payload, {
              timeoutMs: CONFIG.TTS_TIMEOUT_MS,
              retries: CONFIG.RETRY_ATTEMPTS,
              signal
            });
          } catch (fetchErr: any) {
            if (signal.aborted) throw fetchErr;
            console.warn(`[PiperTTS] Primary fetch to ${primaryUrl} failed. Retrying relative /api/tts fallback...`, fetchErr);
            res = await httpClient.post('/api/tts', payload, {
              timeoutMs: CONFIG.TTS_TIMEOUT_MS,
              retries: 0,
              signal
            });
          }

          const buf = await res.arrayBuffer();
          if (!buf || buf.byteLength === 0) {
            throw new Error("Received empty 0-byte audio buffer from Piper backend.");
          }
          return buf;
        })();

        this.inflightFetchMap.set(cacheKey, fetchPromise);

        try {
          arrayBuffer = await fetchPromise;
        } finally {
          this.inflightFetchMap.delete(cacheKey);
        }

        // Cache raw audio ArrayBuffer
        if (this.audioCache.size >= CONFIG.MAX_AUDIO_CACHE_SIZE) {
          const firstKey = this.audioCache.keys().next().value;
          if (firstKey) {
            this.audioCache.delete(firstKey);
            this.decodedCache.delete(firstKey);
          }
        }
        this.audioCache.set(cacheKey, arrayBuffer);
      }

      if (signal.aborted) {
        this.setLoading(false);
        return false;
      }

      // Method 1: Web Audio API Playback (Preferred)
      if (this.audioContext) {
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        let audioBuffer: AudioBuffer | undefined = this.decodedCache.get(cacheKey);
        if (!audioBuffer) {
          audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
          this.decodedCache.set(cacheKey, audioBuffer);
        }

        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        sourceNode.playbackRate.value = options.settings.rate || 1.0;
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.settings.volume !== undefined ? options.settings.volume : 1.0;

        sourceNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        this.currentSourceNode = sourceNode;
        sourceNode.onended = () => {
          console.info("[PiperTTS] Web Audio API playback lifecycle completed.");

          this.currentRequestKey = null;
          this.currentSourceNode = null;
          this.setLoading(false);

          if (options.onEnd) options.onEnd();
        };

        const playbackStart = performance.now();
        sourceNode.start(0);

        console.info(`[PiperTTS Telemetry] 🔊 Playback active in ${(playbackStart - requestStart).toFixed(1)}ms`);

        this.setLoading(false);
        if (options.onStart) options.onStart();
        return true;
      }

      // Method 2: HTML5 Audio Element Fallback
      console.info("[PiperTTS] Playing via HTML5 Audio element fallback...");
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      this.activeBlobUrl = URL.createObjectURL(blob);

      const audio = new Audio(this.activeBlobUrl);
      audio.playbackRate = options.settings.rate || 1.0;
      audio.volume = options.settings.volume !== undefined ? options.settings.volume : 1.0;

      this.currentAudio = audio;

      audio.onplay = () => {
        console.info("[PiperTTS] HTML5 Audio playback started successfully.");
        this.setLoading(false);
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        console.info("[PiperTTS] HTML5 Audio playback finished.");
        this.currentRequestKey = null;
        this.setLoading(false);
        if (this.activeBlobUrl) {
          URL.revokeObjectURL(this.activeBlobUrl);
          this.activeBlobUrl = null;
        }
        this.currentAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (err) => {
        console.error("[PiperTTS] HTML5 Audio play error:", err);
        this.currentRequestKey = null;
        this.setLoading(false);
        this.currentAudio = null;
        if (options.onError) options.onError(new Error("HTML5 Audio play error"));
        if (options.onEnd) options.onEnd();
      };

      await audio.play();
      return true;

    } catch (error: any) {
      this.currentRequestKey = null;
      if (error.name === 'AbortError' || signal.aborted) {
        console.info("[PiperTTS] Playback request aborted.");
        this.setLoading(false);
        return false;
      }

      console.error("[PiperTTS] Speech generation or decoding failed:", error);
      this.setLoading(false);
      if (options.onError) options.onError(error as Error);
      if (options.onEnd) options.onEnd();
      return false;
    }
  }

  public enqueue(options: PiperSpeakOptions): void {
    this.speechQueue.push(options);
    if (!this.isProcessingQueue && !this.isSpeaking()) {
      this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    if (this.speechQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const nextItem = this.speechQueue.shift();

    if (nextItem) {
      const originalOnEnd = nextItem.onEnd;
      nextItem.onEnd = () => {
        if (originalOnEnd) originalOnEnd();
        this.processQueue();
      };
      await this.speak(nextItem);
    }
  }

  public pause(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    }
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(e => console.warn("[PiperTTS] Resume failed:", e));
    }
  }

  public replay(): void {
    if (this.currentOptions) {
      console.info("[PiperTTS] Replaying last Piper audio request.");
      this.speak(this.currentOptions);
    }
  }

  public isSpeaking(): boolean {
    const isSourcePlaying = this.currentSourceNode !== null;
    const isAudioPlaying = this.currentAudio !== null && !this.currentAudio.paused;
    return isSourcePlaying || isAudioPlaying;
  }

  public isPaused(): boolean {
    const isAudioPaused = this.currentAudio !== null && this.currentAudio.paused;
    const isCtxSuspended = this.audioContext !== null && this.audioContext.state === 'suspended';
    return isAudioPaused || isCtxSuspended;
  }

  public isLoading(): boolean {
    return this.isLoadingAudio;
  }
}

export const piperTTS = new PiperTTSService();
