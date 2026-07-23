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

/**
 * Normalizes speech recognition language codes to exact BCP-47 identifiers.
 * Specifically maps Telugu ('te' -> 'te-IN'), Hindi ('hi' -> 'hi-IN'), English ('en' -> 'en-US').
 */
function normalizeSpeechLanguage(lang: LanguageCode | string): string {
  if (!lang) return 'en-US';
  const str = String(lang).toLowerCase();
  if (str.includes('te')) return 'te-IN';
  if (str.includes('hi')) return 'hi-IN';
  if (str.includes('en')) return 'en-US';
  return String(lang);
}

/**
 * Normalizes whitespace and trims transcript without lowercasing or stripping Unicode.
 */
function cleanTranscript(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deduplicates and merges transcripts based on word-level suffix/prefix overlaps.
 * Preserves Telugu Unicode text and prevents sentence overwriting.
 */
function mergeTranscripts(existing: string, addition: string): string {
  const e = cleanTranscript(existing);
  const a = cleanTranscript(addition);
  if (!e) return a;
  if (!a) return e;

  if (e === a || e.endsWith(a) || e.toLowerCase().endsWith(a.toLowerCase())) {
    return e;
  }

  const eWords = e.split(/\s+/);
  const aWords = a.split(/\s+/);

  let overlapCount = 0;
  const maxOverlap = Math.min(eWords.length, aWords.length);

  for (let len = maxOverlap; len > 0; len--) {
    const eSuffix = eWords.slice(eWords.length - len).join(' ').toLowerCase();
    const aPrefix = aWords.slice(0, len).join(' ').toLowerCase();
    if (eSuffix === aPrefix) {
      overlapCount = len;
      break;
    }
  }

  if (overlapCount > 0) {
    const newWords = aWords.slice(overlapCount);
    return `${e} ${newWords.join(' ')}`.trim();
  }

  return `${e} ${a}`;
}

export class SpeechRecognitionService {
  private recognition: InstanceType<typeof window.SpeechRecognition> | null = null;
  private state: SpeechRecognitionState = 'IDLE';
  private continuous: boolean = true;
  private lang: LanguageCode = 'en-US';
  private activeCallbacks: SpeechRecognitionCallbacks | null = null;
  private pendingStart: { lang: LanguageCode; continuous: boolean; callbacks: SpeechRecognitionCallbacks } | null = null;
  private stateChangeListeners: Set<(state: SpeechRecognitionState) => void> = new Set();

  private isUserListening: boolean = false;
  private isManualStop: boolean = false;
  private accumulatedTranscript: string = '';
  private sessionTranscript: string = '';
  private lastFinalTranscript: string = '';
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private sendDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.lang = 'en-US';
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = normalizeSpeechLanguage('en-US');
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 3;
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
      this.state = newState;
      this.stateChangeListeners.forEach((fn) => fn(newState));
    }
  }

  public setLanguage(lang: LanguageCode): void {
    this.lang = lang;
    const speechLang = normalizeSpeechLanguage(lang);
    if (this.recognition) {
      this.recognition.lang = speechLang;
    }
  }

  public setProcessing(processing: boolean): void {
    if (processing) {
      console.info('[VOICE STOP]', { reason: 'Processing triggered' });
      this.isUserListening = false;
      this.isManualStop = true;
      this.clearRestartTimer();
      this.clearSendDebounceTimer();
      if (this.state === 'LISTENING' || this.state === 'STARTING') {
        this.stop();
      }
      this.setState('PROCESSING');
    } else if (this.state === 'PROCESSING') {
      this.isManualStop = false;
      this.setState('IDLE');
    }
  }

  public notifyTTSSpeaking(isSpeaking: boolean): void {
    if (isSpeaking) {
      console.info('[VOICE STOP]', { reason: 'Piper TTS speaking active' });
      this.isUserListening = false;
      this.isManualStop = true;
      this.clearRestartTimer();
      this.clearSendDebounceTimer();
      this.pendingStart = null;
      if (this.state === 'LISTENING' || this.state === 'STARTING' || this.state === 'STOPPING') {
        this.stop();
      }
      this.setState('SPEAKING');
    } else {
      if (this.state === 'SPEAKING') {
        this.isManualStop = false;
        this.setState('IDLE');
      }
    }
  }

  private clearRestartTimer(): void {
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }

  private clearSendDebounceTimer(): void {
    if (this.sendDebounceTimer) {
      clearTimeout(this.sendDebounceTimer);
      this.sendDebounceTimer = null;
    }
  }

  private flushBufferedSentence(): void {
    this.clearSendDebounceTimer();
    const completeSentence = cleanTranscript(this.sessionTranscript);
    this.sessionTranscript = '';
    this.lastFinalTranscript = '';
    if (completeSentence && this.activeCallbacks?.onResult) {
      this.activeCallbacks.onResult(completeSentence, true);
    }
  }

  public start(
    lang: LanguageCode,
    continuous: boolean,
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (!this.recognition) {
      const errMsg = "Browser speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.";
      console.error('[VOICE ERROR]', errMsg);
      if (callbacks.onError) {
        callbacks.onError(errMsg);
      }
      return false;
    }

    // Protection 1: Never start if Piper TTS is currently speaking or processing
    if (this.state === 'SPEAKING' || this.state === 'PROCESSING') {
      console.warn("[VOICE WARNING] Cannot start recognition while Piper TTS is speaking or processing.");
      return false;
    }

    // Protection 2: If already starting or listening, update callbacks/config without calling recognition.start()
    if (this.state === 'STARTING' || this.state === 'LISTENING') {
      this.activeCallbacks = callbacks;
      return true;
    }

    // Protection 3: If in middle of stopping, queue start request for after onend fires
    if (this.state === 'STOPPING') {
      this.pendingStart = { lang, continuous, callbacks };
      return true;
    }

    const speechLang = normalizeSpeechLanguage(lang);

    this.clearRestartTimer();
    this.clearSendDebounceTimer();
    this.isUserListening = true;
    this.isManualStop = false;

    this.lang = lang;
    this.continuous = true;
    this.activeCallbacks = callbacks;
    this.sessionTranscript = '';
    this.accumulatedTranscript = '';
    this.lastFinalTranscript = '';
    this.recognition.lang = speechLang;
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 3;

    console.info('[VOICE START]', { lang: this.lang, appliedLang: speechLang });

    this.setupRecognitionHandlers();

    try {
      this.setState('STARTING');
      this.recognition.start();
      return true;
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        console.warn("[VOICE WARNING] Recognition already active in browser engine (InvalidStateError handled).");
        this.setState('LISTENING');
        return true;
      }
      console.error('[VOICE ERROR]', err?.message || err);
      this.setState('IDLE');
      this.isUserListening = false;
      if (callbacks.onError) {
        callbacks.onError('Could not access microphone.');
      }
      return false;
    }
  }

  private setupRecognitionHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      console.info('[VOICE START]', { lang: this.lang, appliedLang: normalizeSpeechLanguage(this.lang) });
      this.setState('LISTENING');
      if (this.activeCallbacks?.onStart) {
        this.activeCallbacks.onStart();
      }
    };

    this.recognition.onresult = (event: any) => {
      if (this.state !== 'LISTENING' && this.state !== 'STARTING') {
        return;
      }

      let interimTranscript = '';
      let finalSegment = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalSegment += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const cleanFinal = cleanTranscript(finalSegment);
      if (cleanFinal) {
        if (cleanFinal !== this.lastFinalTranscript) {
          this.lastFinalTranscript = cleanFinal;
          this.sessionTranscript = mergeTranscripts(this.sessionTranscript, cleanFinal);
          this.accumulatedTranscript = this.sessionTranscript;
        }
      }

      let fullTranscript = this.sessionTranscript;
      const cleanInterim = cleanTranscript(interimTranscript);
      if (cleanInterim) {
        fullTranscript = mergeTranscripts(this.sessionTranscript, cleanInterim);
      }

      // Emit live interim transcript to UI instantaneously as user speaks
      if (fullTranscript && this.activeCallbacks?.onResult) {
        this.activeCallbacks.onResult(fullTranscript, false);
      }

      // Debounce 1200ms silence check before triggering final sentence send
      this.clearSendDebounceTimer();
      this.sendDebounceTimer = setTimeout(() => {
        if (this.isUserListening && !this.isManualStop) {
          this.flushBufferedSentence();
        }
      }, 1200);
    };

    this.recognition.onerror = (event: any) => {
      const errName = event.error || 'unknown';
      let userFriendlyMessage = `Speech error: ${errName}`;

      if (errName === 'not-allowed') {
        userFriendlyMessage = 'Microphone permission denied';
      } else if (errName === 'audio-capture') {
        userFriendlyMessage = 'No microphone detected';
      } else if (errName === 'network') {
        userFriendlyMessage = 'Speech recognition network unavailable';
      } else if (errName === 'no-speech') {
        userFriendlyMessage = 'Waiting for voice input';
      }

      console.error('[VOICE ERROR]', { error: errName, userFriendlyMessage });

      const isTransient = ['no-speech', 'audio-capture', 'network', 'aborted'].includes(errName);

      if (!isTransient && this.activeCallbacks?.onError) {
        this.activeCallbacks.onError(userFriendlyMessage);
      }
    };

    this.recognition.onend = () => {
      // Continuous Auto-Restart check for silence timeouts / engine resets
      const shouldAutoRestart =
        !this.isManualStop &&
        this.isUserListening &&
        this.state !== 'SPEAKING' &&
        this.state !== 'PROCESSING';

      if (shouldAutoRestart) {
        const restartDelay = 700;
        this.clearRestartTimer();
        this.restartTimer = setTimeout(() => {
          if (this.isUserListening && !this.isManualStop && this.state !== 'STARTING' && this.state !== 'LISTENING' && this.state !== 'SPEAKING' && this.state !== 'PROCESSING') {
            try {
              const targetLang = normalizeSpeechLanguage(this.lang);
              if (this.recognition) {
                this.recognition.lang = targetLang;
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.maxAlternatives = 3;
              }
              this.setState('STARTING');
              this.recognition.start();
            } catch (err: any) {
              if (err.name === 'InvalidStateError') {
                console.warn('[VOICE WARNING] Auto-restart target already started.');
                this.setState('LISTENING');
              } else {
                console.warn('[VOICE WARNING] Initial auto-restart attempt failed:', err?.message || err);
              }
            }
          }
        }, restartDelay);
        return;
      }

      // Manual stop by user, TTS speaking, or processing
      const currentCb = this.activeCallbacks;
      this.activeCallbacks = null;
      this.isUserListening = false;

      if (this.isManualStop) {
        this.sessionTranscript = '';
        this.accumulatedTranscript = '';
        this.lastFinalTranscript = '';
      }

      const queued = this.pendingStart;
      this.pendingStart = null;

      if (this.state !== 'SPEAKING' && this.state !== 'PROCESSING') {
        this.setState('IDLE');
      }

      if (currentCb?.onEnd) {
        currentCb.onEnd();
      }

      if (queued && this.state === 'IDLE') {
        this.start(queued.lang, queued.continuous, queued.callbacks);
      }
    };
  }

  public stop(): void {
    if (!this.recognition) return;
    console.info('[VOICE STOP]', { isManual: true });
    this.flushBufferedSentence();
    this.isUserListening = false;
    this.isManualStop = true;
    this.sessionTranscript = '';
    this.accumulatedTranscript = '';
    this.lastFinalTranscript = '';
    this.clearRestartTimer();
    this.clearSendDebounceTimer();

    if (this.state === 'STARTING' || this.state === 'LISTENING') {
      this.setState('STOPPING');
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("[VOICE WARNING] Stop call ignored:", e);
        this.setState('IDLE');
      }
    }
  }

  public abort(): void {
    console.info('[VOICE STOP]', { isManual: true });
    this.flushBufferedSentence();
    this.isUserListening = false;
    this.isManualStop = true;
    this.sessionTranscript = '';
    this.accumulatedTranscript = '';
    this.lastFinalTranscript = '';
    this.clearRestartTimer();
    this.clearSendDebounceTimer();
    this.abortInternal();
  }

  private abortInternal(): void {
    if (!this.recognition) return;
    this.pendingStart = null;
    try {
      this.recognition.abort();
    } catch (e) {
      console.warn("[VOICE WARNING] Abort error ignored:", e);
    }
    if (this.state !== 'SPEAKING') {
      this.setState('STOPPING');
    }
  }
}

export const speechRecognizer = new SpeechRecognitionService();
