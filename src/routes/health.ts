import { Router, Request, Response } from 'express';
import { getHealth } from '@/controllers/health';

const router = Router();

/**
 * @route GET /_health
 * @desc Get API health status
 * @access Public
 */
router.get('/_health', (req: Request, res: Response) => {
  const data = getHealth();
  res.status(200).send(data);
});

/**
 * @route GET /test
 * @desc Test route to verify nodemon is working
 * @access Public
 */
router.get('/test', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Nodemon is working!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
// Test comment
// Test change Sat Jul 12 19:31:28 IST 2025
