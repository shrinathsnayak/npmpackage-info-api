import zlib from 'zlib';
import compression from 'compression';
import http from 'http';
import https from 'https';
import { WHITELIST_DOMAINS } from '@/constants';

// Optimized timeout configuration for better performance
export const axiosTimeout = 10000; // 10 seconds (increased for external API calls)
export const requestTimeout = 15000; // 15 seconds (increased for better reliability)

// Retry configuration
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_MULTIPLIER: 2,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
  RETRYABLE_ERROR_CODES: ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND']
};

// HTTP keep-alive configuration for connection reuse
export const axiosConfig = {
  timeout: axiosTimeout,
  headers: {
    'User-Agent': 'npm-package-info-api/1.0.0',
    Connection: 'keep-alive',
    'Accept-Encoding': 'gzip, deflate, br'
  },
  // Enable connection pooling and keep-alive
  httpAgent: new http.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 50,
    maxFreeSockets: 10,
    timeout: 60000
  })
};

/**
 * Create axios instance with automatic retry functionality
 * @returns Axios instance with retry interceptors
 */
export const createAxiosInstanceWithRetry = () => {
  const axios = require('axios');
  const instance = axios.create(axiosConfig);

  // Request interceptor for logging
  instance.interceptors.request.use(
    (config: any) => {
      config.metadata = { startTime: new Date() };
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor with retry logic
  instance.interceptors.response.use(
    (response: any) => {
      const duration = new Date().getTime() - response.config.metadata.startTime;
      if (duration > 5000) {
        console.warn(`[SLOW API] ${response.config.url} took ${duration}ms`);
      }
      return response;
    },
    async (error: any) => {
      const duration = new Date().getTime() - (error.config?.metadata?.startTime || new Date());

      // Check if error is retryable
      const isRetryable = (
        error.code && RETRY_CONFIG.RETRYABLE_ERROR_CODES.includes(error.code) ||
        error.response?.status && RETRY_CONFIG.RETRYABLE_STATUS_CODES.includes(error.response.status) ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('timeout')
      );

      // Only retry if it's a retryable error and we haven't exceeded max retries
      if (isRetryable && error.config) {
        const currentRetry = error.config.__retryCount || 0;

        if (currentRetry < RETRY_CONFIG.MAX_RETRIES) {
          // Increment retry count
          error.config.__retryCount = currentRetry + 1;

          const delay = Math.min(
            RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, currentRetry),
            RETRY_CONFIG.MAX_DELAY
          );

          console.warn(`[AXIOS RETRY] ${error.config.url} - Attempt ${currentRetry + 1}/${RETRY_CONFIG.MAX_RETRIES + 1}:`, {
            error: error.message,
            status: error.response?.status,
            code: error.code,
            delay: `${delay}ms`
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));

          // Retry the request with a fresh config
          const retryConfig = { ...error.config };
          delete retryConfig.__isRetryRequest; // Reset retry flag
          return instance.request(retryConfig);
        }
      }

      // Log final error
      console.error(`[API ERROR] ${error.config?.url || 'Unknown URL'}:`, {
        error: error.message,
        status: error.response?.status,
        code: error.code,
        duration: `${duration}ms`,
        retryCount: error.config?.__retryCount || 0
      });

      return Promise.reject(error);
    }
  );

  return instance;
};

/* The `export const corsOptions` object is defining a configuration for Cross-Origin Resource Sharing
(CORS) in a Node.js application. It specifies the behavior for allowing or denying requests from
different origins based on a whitelist of domains defined in `WHITELIST_DOMAINS`. */
export const corsOptions: any = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || WHITELIST_DOMAINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

/* The above code is configuring compression options for a server using the compression library in
TypeScript. It sets various options such as compression level, threshold, filter function based on
request and response headers, chunk size, flush options, memory level, compression strategy, and
window bits. These options are used to determine how and when to compress the response data sent
from the server to the client. */
export const compressionOptions: any = compression({
  level: 6,
  threshold: 1024,
  filter: (req: any, res: any) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    const contentType = res.getHeader('Content-Type');
    return (
      contentType &&
      /text|json|javascript|css|html/.test(contentType.toString())
    );
  },
  chunkSize: 100 * 1024,
  flush: zlib.constants.Z_NO_FLUSH,
  finishFlush: zlib.constants.Z_SYNC_FLUSH,
  memLevel: 6,
  strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  windowBits: 15
});

export const vercelCachingHeaders = {
  'Cache-Control': 'max-age=10',
  'CDN-Cache-Control': 'max-age=60',
  'Vercel-CDN-Cache-Control': 'max-age=3600'
};
