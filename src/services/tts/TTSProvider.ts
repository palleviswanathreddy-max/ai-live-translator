import { VoiceSettings, LanguageCode } from '../../types';

export interface TTSPlayOptions {
  text: string;
  lang: LanguageCode;
  settings: VoiceSettings;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: Error) => void;
}

export interface ITTSProvider {
  name: string;
  isAvailable(lang: LanguageCode): Promise<boolean>;
  speak(options: TTSPlayOptions): Promise<boolean>;
  pause(): void;
  resume(): void;
  stop(): void;
  replay(): void;
  isSpeaking(): boolean;
  isPaused(): boolean;
  isLoading?(): boolean;
}
