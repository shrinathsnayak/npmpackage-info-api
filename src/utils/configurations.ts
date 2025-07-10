import zlib from 'zlib';
import compression from 'compression';
import http from 'http';
import https from 'https';
import { DOMAIN_NAME, WHITELIST_DOMAINS } from '@/constants';

// Optimized timeout configuration for better performance
export const axiosTimeout = 3000; // 3 seconds (reduced for faster failure detection)
export const requestTimeout = 8000; // 8 seconds (reduced for faster responses)

// HTTP keep-alive configuration for connection reuse
export const axiosConfig = {
  timeout: axiosTimeout,
  headers: {
    'User-Agent': 'npm-package-info-api/1.0.0',
    'Connection': 'keep-alive',
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
