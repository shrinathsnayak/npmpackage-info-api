import { Router, Request, Response } from 'express';
import { getPackageInfo } from '@/controllers/package';
import { getPkgInfo } from '@/services/npm';
import { getBundlePhobiaData } from '@/services/bundlephobia';
import { tryCatchWrapper } from '@/utils/error';
import { handleMissingParameter } from '@/utils/error';
import { vercelCachingHeaders } from '@/utils/configurations';
import messages from '@/constants/messages';

const router = Router();

/**
 * @route GET /package
 * @desc Get comprehensive package information
 * @access Public
 */
router.get('/package', (req: Request, res: Response) => {
  const { q } = req?.query as { q: string };

  if (!q) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageInfo(req);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

/**
 * @route GET /npm
 * @desc Get NPM package information
 * @access Public
 */
router.get('/npm', (req: Request, res: Response) => {
  const { project, version = 'latest' } = req.query as {
    project: string;
    version: string;
  };
  if (!project) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPkgInfo(project, version);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

/**
 * @route GET /bundlephobia
 * @desc Get bundle size information for a package
 * @access Public
 */
router.get('/bundlephobia', (req: Request, res: Response) => {
  const { package: packageName } = req.query as { package: string };
  if (!packageName) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getBundlePhobiaData(packageName);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

export default router;
