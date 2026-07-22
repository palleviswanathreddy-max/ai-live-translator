import { LanguageCode } from '../types';

// Declare Web Speech API global types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;
  private continuous: boolean = false;
  private lang: LanguageCode = 'en-US';

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    }
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public setLanguage(lang: LanguageCode): void {
    this.lang = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public start(
    lang: LanguageCode,
    continuous: boolean,
    callbacks: SpeechRecognitionCallbacks
  ): boolean {
    if (!this.recognition) {
      if (callbacks.onError) callbacks.onError("Browser speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return false;
    }

    if (this.isListening) {
      this.stop();
    }

    this.lang = lang;
    this.continuous = continuous;
    this.recognition.lang = lang;
    this.recognition.continuous = continuous;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (callbacks.onStart) callbacks.onStart();
    };

    this.recognition.onresult = (event: any) => {
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
      if (text && callbacks.onResult) {
        callbacks.onResult(text, isFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      this.isListening = false;
      if (callbacks.onError) {
        callbacks.onError(event.error === 'no-speech' ? 'No speech detected. Please speak clearly.' : `Speech error: ${event.error}`);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (callbacks.onEnd) callbacks.onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (err: any) {
      console.error("Failed to start speech recognition:", err);
      if (callbacks.onError) callbacks.onError("Could not access microphone.");
      return false;
    }
  }

  public stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.log("Stop error ignored", e);
      }
      this.isListening = false;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechRecognizer = new SpeechRecognitionService();
