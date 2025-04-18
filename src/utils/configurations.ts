import zlib from 'zlib';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { DOMAIN_NAME, WHITELIST_DOMAINS } from '@/constants';

/* The above code is implementing a rate limiter middleware in a TypeScript application. It checks if
the environment is set to 'production', and if so, it applies rate limiting with the following
configuration:
- Window time of 15 minutes (15 * 60 * 1000 milliseconds)
- Allowing a maximum of 100 requests within the window time
- Providing a handler function to respond with a 429 status code and a message if the limit is
exceeded
- Using a skip function to bypass rate limiting for requests coming from a specific domain specified
by the DOMAIN_NAME variable */
export const rateLimiter =
  process.env.NODE_ENV === 'production'
    ? rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        handler: (req, res) => {
          res
            .status(429)
            .json({ message: 'Too many requests, please try again later.' });
        },
        skip: (req) => {
          const referer = req.headers.referer || '';
          const origin = req.headers.origin || '';
          return referer.startsWith(DOMAIN_NAME) || origin === DOMAIN_NAME;
        }
      })
    : (req: any, res: any, next: any) => next();

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
