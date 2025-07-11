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

export default router; 