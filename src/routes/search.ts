import { Router, Request, Response } from 'express';
import { searchPackage } from '@/services/npm';
import { getPackageVulnerabilities } from '@/services/github';
import { getVulnerabilityScore } from '@/services/socket';
import { tryCatchWrapper } from '@/utils/error';
import { handleMissingParameter } from '@/utils/error';
import { vercelCachingHeaders } from '@/utils/configurations';
import messages from '@/constants/messages';

const router = Router();

/**
 * @route GET /search
 * @desc Search NPM packages
 * @access Public
 */
router.get('/search', async (req: Request, res: Response) => {
  const { q, size } = req?.query as { q?: string; size?: number };

  if (!q) {
    handleMissingParameter(res, 404, messages.errors.SEARCH_QUERY_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await searchPackage(q, size);
      res.status(200).send(data);
    })();
  }
});

/**
 * @route GET /vulnerabilities
 * @desc Get package vulnerability information
 * @access Public
 */
router.get('/vulnerabilities', async (req: Request, res: Response) => {
  const { name, version } = req?.query as { name: string; version: string };
  if (!name) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageVulnerabilities(name, version);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

/**
 * @route GET /vulnerability-score
 * @desc Get vulnerability score for a specific package and version
 * @access Public
 */
router.get('/vulnerability-score', async (req: Request, res: Response) => {
  const { name, version } = req?.query as { name: string; version: string };
  if (!name) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getVulnerabilityScore(name, version || 'latest');
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

export default router;
