/// <reference types="vite/client" />
import { VoiceSettings, LanguageCode } from '../types';

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
  private isProcessingQueue: boolean = false;
  private speechQueue: PiperSpeakOptions[] = [];
  private currentOptions: PiperSpeakOptions | null = null;
  private loadingListeners: Set<(loading: boolean) => void> = new Set();
  private isLoadingAudio: boolean = false;
  private isAudioUnlocked: boolean = false;
  private ttsEchoTimer: ReturnType<typeof setTimeout> | null = null;
  private inflightFetchMap: Map<string, Promise<ArrayBuffer>> = new Map();

  constructor() {
    this.initAudioContext();
    this.setupAutoplayUnlock();
  }

  private initAudioContext() {
    if (typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        console.info(`[PiperTTS Logs] Initialized AudioContext. Initial state: ${this.audioContext.state}`);
      }
    }
  }

  private setupAutoplayUnlock() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          console.info(`[PiperTTS Logs] AudioContext resumed by user interaction. Current state: ${this.audioContext?.state}`);
          this.isAudioUnlocked = true;
        }).catch(e => console.warn("[PiperTTS Logs] AudioContext resume failed:", e));
      } else {
        this.isAudioUnlocked = true;
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

  private getBackendUrl(): string {
    const customUrl = localStorage.getItem('mv_piper_api_url') || import.meta.env.VITE_PIPER_API_URL;
    if (customUrl) {
      return `${customUrl.replace(/\/$/, '')}/api/tts`;
    }
    return 'http://localhost:5000/api/tts';
  }

  public async speak(options: PiperSpeakOptions): Promise<boolean> {
    if (!options.text || !options.text.trim()) return false;

    // Interrupt previous playback
    this.stop();

    const cleanText = options.text.trim();
    const langTag = options.lang.startsWith('te') ? 'te' : 'en';
    const cacheKey = `piper_buf:${langTag}:${cleanText}`;
    const primaryUrl = this.getBackendUrl();

    console.info(`[PiperTTS Logs] 1. speak() initiated for lang '${langTag}': "${cleanText.slice(0, 35)}..."`);
    console.info(`[PiperTTS Logs] Current AudioContext state before fetch: ${this.audioContext ? this.audioContext.state : 'null'}`);
    
    this.setLoading(true);
    this.currentOptions = options;

    try {
      let arrayBuffer: ArrayBuffer | undefined = this.audioCache.get(cacheKey);

      if (arrayBuffer) {
        console.info(`[PiperTTS Logs] Loaded cached ArrayBuffer for key: ${cacheKey}`);
      } else if (this.inflightFetchMap.has(cacheKey)) {
        console.info(`[PiperTTS Logs] 🔄 Deduplicating in-flight fetch request for key: ${cacheKey}`);
        arrayBuffer = await this.inflightFetchMap.get(cacheKey)!;
      } else {
        console.info(`[PiperTTS Logs] 2. fetch started ➔ Target URL: ${primaryUrl}`);

        const fetchPromise = (async () => {
          let res: Response;
          try {
            res = await fetch(primaryUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/wav, audio/mpeg, audio/*'
              },
              body: JSON.stringify({ text: cleanText, lang: langTag, model: 'te_IN-padmavathi-medium' })
            });
          } catch (fetchErr) {
            console.warn(`[PiperTTS Logs] Direct fetch to ${primaryUrl} failed. Trying relative /api/tts fallback...`, fetchErr);
            res = await fetch('/api/tts', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'audio/wav, audio/mpeg, audio/*'
              },
              body: JSON.stringify({ text: cleanText, lang: langTag, model: 'te_IN-padmavathi-medium' })
            });
          }

          const contentType = res.headers.get('content-type') || 'unknown';
          console.info(`[PiperTTS Logs] 3. fetch completed ➔ Status: ${res.status} ${res.statusText}, Content-Type: ${contentType}`);

          if (!res.ok) {
            throw new Error(`Piper TTS HTTP Error ${res.status}: ${res.statusText}`);
          }

          const buf = await res.arrayBuffer();
          console.info(`[PiperTTS Logs] ArrayBuffer payload size: ${buf.byteLength} bytes.`);

          if (buf.byteLength === 0) {
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

        this.audioCache.set(cacheKey, arrayBuffer.slice(0));
      }

      // Ensure AudioContext is initialized and resumed
      if (this.audioContext) {
        if (this.audioContext.state === 'suspended') {
          console.info("[PiperTTS Logs] Resuming suspended AudioContext before decoding...");
          await this.audioContext.resume();
        }

        console.info(`[PiperTTS Logs] AudioContext state before decode: ${this.audioContext.state}`);
        console.info("[PiperTTS Logs] 4. Decoding audio data via Web Audio API...");

        let audioBuffer: AudioBuffer;
        try {
          audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0));
          console.info(`[PiperTTS Logs] decodeAudioData success! Duration: ${audioBuffer.duration.toFixed(3)}s, SampleRate: ${audioBuffer.sampleRate}Hz, Channels: ${audioBuffer.numberOfChannels}`);
        } catch (decodeErr) {
          console.error("[PiperTTS Logs] decodeAudioData failure:", decodeErr);
          throw decodeErr;
        }

        const sourceNode = this.audioContext.createBufferSource();
        sourceNode.buffer = audioBuffer;

        // Apply voice settings: playbackRate & volume gain
        sourceNode.playbackRate.value = options.settings.rate || 1.0;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = options.settings.volume !== undefined ? options.settings.volume : 1.0;

        sourceNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        this.currentSourceNode = sourceNode;

        sourceNode.onended = () => {
          console.info("[PiperTTS Logs] AudioBufferSourceNode playback lifecycle completed (ended).");
          this.setLoading(false);
          this.currentSourceNode = null;
          if (options.onEnd) options.onEnd();
        };

        sourceNode.start(0);
        console.info(`[PiperTTS Logs] 5. source.start() executed successfully! AudioContext state: ${this.audioContext.state} 🔊`);
        this.setLoading(false);
        if (options.onStart) options.onStart();
        return true;
      }

      // Fallback: HTML5 Audio Element
      console.info("[PiperTTS Logs] Playing via HTML5 Audio element fallback...");
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const blobUrl = URL.createObjectURL(blob);

      const audio = new Audio(blobUrl);
      audio.playbackRate = options.settings.rate || 1.0;
      audio.volume = options.settings.volume !== undefined ? options.settings.volume : 1.0;

      this.currentAudio = audio;

      audio.onplay = () => {
        console.info("[PiperTTS Logs] HTML5 Audio playback started successfully! 🔊");
        this.setLoading(false);
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        console.info("[PiperTTS Logs] HTML5 Audio playback finished.");
        this.setLoading(false);
        this.currentAudio = null;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (err) => {
        console.error("[PiperTTS Logs] HTML5 Audio play error:", err);
        this.setLoading(false);
        this.currentAudio = null;
        if (options.onError) options.onError(new Error("HTML5 Audio play error"));
        if (options.onEnd) options.onEnd();
      };

      await audio.play();
      return true;

    } catch (error) {
      console.error("[PiperTTS Logs] Speech generation or decoding failed:", error);
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

  public stop(): void {
    if (this.currentSourceNode) {
      try { this.currentSourceNode.stop(); } catch {}
      this.currentSourceNode = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.speechQueue = [];
    this.isProcessingQueue = false;
    this.setLoading(false);
  }

  public replay(): void {
    if (this.currentOptions) {
      console.info("[PiperTTS Logs] Replaying last Piper audio request.");
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
