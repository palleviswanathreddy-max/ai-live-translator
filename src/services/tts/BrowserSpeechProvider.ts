import { ITTSProvider, TTSPlayOptions } from './TTSProvider';
import { LanguageCode, VoiceSettings } from '../../types';
import { piperTTS } from '../piperTTSService';

export class BrowserSpeechProvider implements ITTSProvider {
  public name = 'PiperSpeechProvider';
  private lastOptions: TTSPlayOptions | null = null;

  constructor() {
    console.info("[PiperSpeechProvider] Initialized using Piper Neural Engine. Zero browser SpeechSynthesis dependency.");
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

  public async isAvailable(_lang: LanguageCode): Promise<boolean> {
    return true;
  }

  public selectBestVoice(lang: LanguageCode, _settings: VoiceSettings): SpeechSynthesisVoice | undefined {
    const isTelugu = lang.startsWith('te');
    return this.getVoices()[isTelugu ? 0 : 1];
  }

  public async speak(options: TTSPlayOptions): Promise<boolean> {
    if (!options.text || !options.text.trim()) return false;
    this.lastOptions = options;

    console.info(`[PiperSpeechProvider] Delegating speak request to Piper TTS engine for lang '${options.lang}'...`);

    return piperTTS.speak({
      text: options.text,
      lang: options.lang,
      settings: options.settings,
      onStart: options.onStart,
      onEnd: options.onEnd,
      onError: options.onError
    });
  }

  public pause(): void {
    piperTTS.pause();
  }

  public resume(): void {
    piperTTS.resume();
  }

  public stop(): void {
    piperTTS.stop();
  }

  public replay(): void {
    if (this.lastOptions) {
      this.speak(this.lastOptions);
    } else {
      piperTTS.replay();
    }
  }

  public isSpeaking(): boolean {
    return piperTTS.isSpeaking();
  }

  public isPaused(): boolean {
    return piperTTS.isPaused();
  }
}
