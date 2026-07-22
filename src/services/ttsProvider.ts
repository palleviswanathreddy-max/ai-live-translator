/// <reference types="vite/client" />

export type TTSProviderType = 'auto' | 'open_stream' | 'piper_external' | 'browser_speech';

export interface TTSProviderConfig {
  provider: TTSProviderType;
  effectiveProvider: 'open_stream' | 'piper_external' | 'browser_speech';
  externalPiperUrl: string | null;
  isVercel: boolean;
}

export function getTTSProviderConfig(): TTSProviderConfig {
  const isVercel = typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') ||
    Boolean(import.meta.env.VITE_VERCEL)
  );

  const envProvider = (import.meta.env.VITE_TTS_PROVIDER as TTSProviderType) || 'auto';
  const storedProvider = (typeof window !== 'undefined' ? localStorage.getItem('mv_tts_provider') : null) as TTSProviderType | null;
  const activeProvider = storedProvider || envProvider;

  const envPiperUrl = import.meta.env.VITE_PIPER_API_URL as string | undefined;
  const storedPiperUrl = typeof window !== 'undefined' ? localStorage.getItem('mv_piper_api_url') : null;
  const externalPiperUrl = storedPiperUrl || envPiperUrl || null;

  let effectiveProvider: 'open_stream' | 'piper_external' | 'browser_speech' = 'open_stream';

  if (activeProvider === 'piper_external' || (activeProvider === 'auto' && externalPiperUrl)) {
    effectiveProvider = 'piper_external';
  } else if (activeProvider === 'browser_speech') {
    effectiveProvider = 'browser_speech';
  } else if (activeProvider === 'open_stream') {
    effectiveProvider = 'open_stream';
  } else {
    // 'auto' mode
    if (externalPiperUrl) {
      effectiveProvider = 'piper_external';
    } else {
      effectiveProvider = 'open_stream';
    }
  }

  return {
    provider: activeProvider,
    effectiveProvider,
    externalPiperUrl,
    isVercel
  };
}

export function setCustomTTSProvider(provider: TTSProviderType | null, externalPiperUrl?: string | null): void {
  if (typeof window === 'undefined') return;
  if (provider) {
    localStorage.setItem('mv_tts_provider', provider);
  } else {
    localStorage.removeItem('mv_tts_provider');
  }

  if (externalPiperUrl !== undefined) {
    if (externalPiperUrl) {
      localStorage.setItem('mv_piper_api_url', externalPiperUrl);
    } else {
      localStorage.removeItem('mv_piper_api_url');
    }
  }
}
