import { Router, Request, Response } from 'express';
import { getPackageDownloads } from '@/controllers/package';
import { tryCatchWrapper } from '@/utils/error';
import { handleMissingParameter } from '@/utils/error';
import { vercelCachingHeaders } from '@/utils/configurations';
import messages from '@/constants/messages';

const router = Router();

/**
 * @route GET /downloads
 * @desc Get package download statistics
 * @access Public
 */
router.get('/downloads', (req: Request, res: Response) => {
  const { packageName, startDate, endDate } = req.query as {
    packageName: string;
    startDate: string;
    endDate: string;
  };

  if (!packageName) {
    handleMissingParameter(res, 404, messages.errors.PROJECT_NAME_MISSING);
  } else {
    tryCatchWrapper(async () => {
      const data = await getPackageDownloads(packageName, startDate, endDate);
      res.status(200).header(vercelCachingHeaders).send(data);
    })();
  }
});

export default router; 