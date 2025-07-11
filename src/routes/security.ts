import { Router, Request, Response } from 'express';
import { getSecurityScore } from '@/services/securityscan';
import { tryCatchWrapper } from '@/utils/error';
import { handleMissingParameter } from '@/utils/error';
import { vercelCachingHeaders } from '@/utils/configurations';
import messages from '@/constants/messages';

const router = Router();

/**
 * @route GET /scan
 * @desc Get security scan results for a GitHub repository
 * @access Public
 */
router.get('/scan', (req: Request, res: Response) => {
  const { owner, repo } = req?.query as { owner: string; repo: string };
  if (!owner || !repo) {
    handleMissingParameter(res, 404, messages.errors.OWNER_OR_REPO_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getSecurityScore(owner, repo);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

export default router; 