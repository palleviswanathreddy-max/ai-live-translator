import { LanguageCode } from '../types';

// Declare Web Speech API global types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export type SpeechRecognitionState = 
  | 'IDLE'
  | 'STARTING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'SPEAKING'
  | 'STOPPING'
  | 'STOPPED';

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private state: SpeechRecognitionState = 'IDLE';
  private continuous: boolean = false;
  private lang: LanguageCode = 'en-US';
  private activeCallbacks: SpeechRecognitionCallbacks | null = null;
  private pendingStart: { lang: LanguageCode; continuous: boolean; callbacks: SpeechRecognitionCallbacks } | null = null;
  private stateChangeListeners: Set<(state: SpeechRecognitionState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
      }
    }
  }

  public isSupported(): boolean {
    return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
  }

  public getState(): SpeechRecognitionState {
    return this.state;
  }

  public getIsListening(): boolean {
    return this.state === 'LISTENING' || this.state === 'STARTING';
  }

  public onStateChange(listener: (state: SpeechRecognitionState) => void): () => void {
    this.stateChangeListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  private setState(newState: SpeechRecognitionState): void {
    if (this.state !== newState) {
      console.info(`[SpeechRecognitionState] Transition: ${this.state} ➔ ${newState}`);
      this.state = newState;
      this.stateChangeListeners.forEach((fn) => fn(newState));
    }
  }

  public setLanguage(lang: LanguageCode): void {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public setProcessing(processing: boolean): void {
    if (processing) {
      if (this.state === 'LISTENING' || this.state === 'STARTING') {
        this.stop();
      }
      this.setState('PROCESSING');
    } else if (this.state === 'PROCESSING') {
      this.setState('IDLE');
    }
  }

  public notifyTTSSpeaking(isSpeaking: boolean): void {
    if (isSpeaking) {
      console.info("[SpeechRecognitionService] TTS playback active ➔ Locking mic in SPEAKING state");
      this.pendingStart = null;
      if (this.state === 'LISTENING' || this.state === 'STARTING' || this.state === 'STOPPING') {
        this.stop();
      }
      this.setState('SPEAKING');
    } else {
      if (this.state === 'SPEAKING') {
        console.info("[SpeechRecognitionService] TTS playback completed ➔ Unlocking mic to IDLE state");
        this.setState('IDLE');
      }
    }
  }

  public start(
    lang: LanguageCode,
    continuous: boolean,
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (!this.recognition) {
      if (callbacks.onError) {
        callbacks.onError("Browser speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      }
      return false;
    }

    // Protection 1: Never start if Piper TTS is currently speaking
    if (this.state === 'SPEAKING') {
      console.warn("[SpeechRecognitionService] Cannot start recognition while TTS is speaking.");
      return false;
    }

    // Protection 2: If already starting or listening, update callbacks/config without calling recognition.start() again!
    if (this.state === 'STARTING' || this.state === 'LISTENING') {
      console.info("[SpeechRecognitionService] Recognition is already active. Updating callbacks.");
      this.activeCallbacks = callbacks;
      return true;
    }

    // Protection 3: If in middle of stopping, queue start request for after onend fires
    if (this.state === 'STOPPING') {
      console.info("[SpeechRecognitionService] Recognition is stopping. Queueing start request.");
      this.pendingStart = { lang, continuous, callbacks };
      return true;
    }

    this.lang = lang;
    this.continuous = continuous;
    this.activeCallbacks = callbacks;
    this.recognition.lang = lang;
    this.recognition.continuous = continuous;

    this.setupRecognitionHandlers();

    try {
      this.setState('STARTING');
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error("[SpeechRecognitionService] Failed to execute 'start':", err);
      this.setState('IDLE');
      if (callbacks.onError) {
        callbacks.onError(err.name === 'InvalidStateError' ? 'Speech recognition is re-initializing.' : 'Could not access microphone.');
      }
      return false;
    }
  }

  private setupRecognitionHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.info("[SpeechRecognitionService] Engine onstart received");
      this.setState('LISTENING');
      if (this.activeCallbacks?.onStart) {
        this.activeCallbacks.onStart();
      }
    };

    this.recognition.onresult = (event: any) => {
      // Discard results if TTS is speaking or processing
      if (this.state !== 'LISTENING' && this.state !== 'STARTING') {
        console.warn(`[SpeechRecognitionService] Discarding speech result because state is ${this.state}`);
        return;
      }

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = finalTranscript || interimTranscript;
      const isFinal = Boolean(finalTranscript);
      if (text && this.activeCallbacks?.onResult) {
        this.activeCallbacks.onResult(text, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn("[SpeechRecognitionService] Engine onerror:", event.error);
      const isNoSpeech = event.error === 'no-speech';
      if (this.activeCallbacks?.onError) {
        this.activeCallbacks.onError(isNoSpeech ? 'No speech detected. Please speak clearly.' : `Speech error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      console.info("[SpeechRecognitionService] Engine onend received");
      const currentCb = this.activeCallbacks;
      this.activeCallbacks = null;

      // Capture and clear pendingStart before callback execution
      const queued = this.pendingStart;
      this.pendingStart = null;

      // Handle transition based on state
      if (this.state !== 'SPEAKING' && this.state !== 'PROCESSING') {
        this.setState('IDLE');
      }

      if (currentCb?.onEnd) {
        currentCb.onEnd();
      }

      // Process any queued start request safely after onend has cleared the engine
      if (queued && this.state === 'IDLE') {
        console.info("[SpeechRecognitionService] Executing queued start request after engine onend.");
        this.start(queued.lang, queued.continuous, queued.callbacks);
      }
    };
  }

  public stop(): void {
    if (!this.recognition) return;

    if (this.state === 'STARTING' || this.state === 'LISTENING') {
      this.setState('STOPPING');
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("[SpeechRecognitionService] Stop call ignored:", e);
        this.setState('IDLE');
      }
    }
  }

  public abort(): void {
    this.abortInternal();
  }

  private abortInternal(): void {
    if (!this.recognition) return;
    this.pendingStart = null;
    try {
      this.recognition.abort();
    } catch (e) {
      console.warn("[SpeechRecognitionService] Abort error ignored:", e);
    }
    if (this.state !== 'SPEAKING') {
      this.setState('STOPPING');
    }
  }
}

export const speechRecognizer = new SpeechRecognitionService();
