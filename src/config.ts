/// <reference types="vite/client" />

/**
 * AI Live Translator - Centralized Production & Development Configuration
 * Single source of truth for API URLs, environment settings, and service defaults.
 */

export const DEV_BACKEND_URL = 'http://localhost:5000';
export const PROD_BACKEND_URL = 'https://ai-live-piper-backend.onrender.com';

/**
 * Resolves the primary Piper TTS Backend API Base URL based on environment & overrides.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('mv_piper_api_url');
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/$/, '');
    }
  }

  const envUrl = import.meta.env.VITE_PIPER_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // If running locally in development mode
  const isDev = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    Boolean(import.meta.env.DEV)
  );

  return isDev ? DEV_BACKEND_URL : PROD_BACKEND_URL;
}

/**
 * Returns the full /api/tts endpoint URL.
 */
export function getTtsEndpointUrl(): string {
  return `${getApiBaseUrl()}/api/tts`;
}

/**
 * Network & Service Configuration Constants
 */
export const CONFIG = {
  HTTP_TIMEOUT_MS: 15000,
  TTS_TIMEOUT_MS: 25000,
  MAX_AUDIO_CACHE_SIZE: 150,
  MAX_TRANSLATION_CACHE_SIZE: 100,
  RETRY_ATTEMPTS: 1,
  RETRY_BACKOFF_MS: 300,
  APP_NAME: 'AI Live Translator & Academy',
};
