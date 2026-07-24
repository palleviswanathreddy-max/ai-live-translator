import { piperTTS } from './piperTTSService';
import { LanguageCode, VoiceSettings } from '../types';

export interface PlayPiperOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
  settings?: VoiceSettings;
}

/**
 * Reusable Piper Neural TTS Voice playback function.
 * Calls http://localhost:5000/api/tts (or production endpoint),
 * sends JSON payload { text, lang: "te" | "en" }, receives WAV audio Blob, and plays automatically.
 *
 * @param text The text to synthesize and speak
 * @param lang Language identifier ('te', 'en', 'te-IN', 'en-US')
 * @param options Callbacks (onStart, onEnd, onError) and settings
 */
export async function playPiperVoice(
  text: string,
  lang: string,
  options?: PlayPiperOptions
): Promise<boolean> {
  if (!text || !text.trim()) return false;

  const cleanText = text.trim();
  const normalizedLang: LanguageCode = lang.startsWith('te') ? 'te-IN' : 'en-US';

  const defaultSettings: VoiceSettings = options?.settings || {
    voiceGender: 'female',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    autoPlay: true,
    noiseReduction: true,
    autoLanguageDetect: true,
    continuousMode: true
  };

  try {
    return await piperTTS.speak({
      text: cleanText,
      lang: normalizedLang,
      settings: defaultSettings,
      onStart: options?.onStart,
      onEnd: options?.onEnd,
      onError: (err) => {
        console.error("[Piper TTS Error] Piper backend offline or synthesis error:", err.message || err);
        if (options?.onError) options.onError(err);
      }
    });
  } catch (err: any) {
    console.error("[Piper TTS Critical Error] Failed to execute playPiperVoice:", err.message || err);
    if (options?.onError) options.onError(err);
    if (options?.onEnd) options.onEnd();
    return false;
  }
}

export function stopPiperVoice(): void {
  piperTTS.stop();
}

export function isPiperSpeaking(): boolean {
  return piperTTS.isSpeaking();
}
