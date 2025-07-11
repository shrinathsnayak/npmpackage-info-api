import { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { compressionOptions, corsOptions, requestTimeout } from './configurations';

// Request timeout middleware
const timeoutMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        error: 'Request timeout',
        message: 'The request took too long to process'
      });
    }
  }, requestTimeout);

  res.on('finish', () => {
    clearTimeout(timeout);
  });

  next();
};

export function setupMiddleware(app: Express) {
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(compressionOptions);
  app.use(cors(corsOptions));
  app.use(timeoutMiddleware);
} 