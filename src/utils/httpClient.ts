import { CONFIG, getApiBaseUrl } from '../config';

export interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  skipErrorLogging?: boolean;
}

export class HttpError extends Error {
  public status: number;
  public statusText: string;
  public url: string;
  public data?: any;

  constructor(status: number, statusText: string, url: string, data?: any) {
    super(`HTTP Error ${status}: ${statusText} (${url})`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.data = data;
  }
}

/**
 * Reusable Unified HTTP Client with timeout, retry, abort controller,
 * error handling, telemetry logging, and production API URL mapping.
 */
export class HttpClient {
  /**
   * Resolves relative paths (e.g. '/api/tts') to the production/configured API Base URL if needed.
   */
  public resolveUrl(pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    const baseUrl = getApiBaseUrl();
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${baseUrl}${cleanPath}`;
  }

  /**
   * Main request executor with AbortController, Timeout, and Retry support.
   */
  public async request<T = any>(
    pathOrUrl: string,
    options: HttpRequestOptions = {}
  ): Promise<Response> {
    const fullUrl = this.resolveUrl(pathOrUrl);
    const timeoutMs = options.timeoutMs ?? CONFIG.HTTP_TIMEOUT_MS;
    const maxRetries = options.retries ?? CONFIG.RETRY_ATTEMPTS;
    const retryDelay = options.retryDelayMs ?? CONFIG.RETRY_BACKOFF_MS;

    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const userSignal = options.signal;

      // Handle user signal abort
      if (userSignal) {
        if (userSignal.aborted) {
          controller.abort(userSignal.reason);
        } else {
          userSignal.addEventListener('abort', () => controller.abort(userSignal.reason), { once: true });
        }
      }

      const timeoutId = setTimeout(() => {
        controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      const requestOptions: RequestInit = {
        ...options,
        signal: controller.signal
      };

      const startTime = performance.now();

      try {
        if (attempt > 1) {
          console.info(`[HttpClient] 🔄 Retrying request (Attempt ${attempt}/${maxRetries + 1}): ${fullUrl}`);
        }

        const response = await fetch(fullUrl, requestOptions);
        clearTimeout(timeoutId);

        const duration = (performance.now() - startTime).toFixed(1);

        if (!response.ok) {
          // If server error (5xx) and we have retries remaining, retry
          if (response.status >= 500 && attempt <= maxRetries) {
            console.warn(`[HttpClient] Server returned ${response.status}. Retrying in ${retryDelay}ms...`);
            await new Promise(r => setTimeout(r, retryDelay));
            continue;
          }
          throw new HttpError(response.status, response.statusText, fullUrl);
        }

        console.info(`[HttpClient] ✅ HTTP ${response.status} in ${duration}ms ➔ ${fullUrl}`);
        return response;

      } catch (err: any) {
        clearTimeout(timeoutId);

        const isAbort = err.name === 'AbortError' || controller.signal.aborted;
        if (isAbort && userSignal?.aborted) {
          // User intentionally aborted
          throw err;
        }

        if (attempt <= maxRetries && !isAbort) {
          console.warn(`[HttpClient] Network/Timeout error on attempt ${attempt}: ${err.message || err}. Retrying in ${retryDelay}ms...`);
          await new Promise(r => setTimeout(r, retryDelay));
          continue;
        }

        if (!options.skipErrorLogging) {
          console.error(`[HttpClient] ❌ Request failed (${fullUrl}):`, err.message || err);
        }
        throw err;
      }
    }

    throw new Error(`[HttpClient] Request failed after ${maxRetries + 1} attempts.`);
  }

  public async get(pathOrUrl: string, options: HttpRequestOptions = {}): Promise<Response> {
    return this.request(pathOrUrl, { ...options, method: 'GET' });
  }

  public async post(pathOrUrl: string, body?: any, options: HttpRequestOptions = {}): Promise<Response> {
    const headers = new Headers(options.headers || {});
    let payloadBody = body;

    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      payloadBody = JSON.stringify(body);
    }

    return this.request(pathOrUrl, {
      ...options,
      method: 'POST',
      headers,
      body: payloadBody
    });
  }

  public async getJson<T = any>(pathOrUrl: string, options: HttpRequestOptions = {}): Promise<T> {
    const res = await this.get(pathOrUrl, options);
    return res.json();
  }

  public async postJson<T = any>(pathOrUrl: string, body?: any, options: HttpRequestOptions = {}): Promise<T> {
    const res = await this.post(pathOrUrl, body, options);
    return res.json();
  }
}

export const httpClient = new HttpClient();
