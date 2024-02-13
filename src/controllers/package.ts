import { Request } from 'express';
import { getPkgInfo } from '@/services/npm';
import { getRepositoryInfo } from '@/services/github';
import { getBundlePhobiaData } from '@/services/bundlephobia';
import { getPackageId } from '@/utils/helpers';

/**
 * The function `getPackageInfo` takes a request object, retrieves package information and related
 * data, and returns an object containing the package information, bundlephobia data, and GitHub
 * information (if available).
 * @param {Request} req - The `req` parameter is of type `Request`. It is likely an object that
 * represents an HTTP request and contains information such as the request method, headers, query
 * parameters, and request body.
 * @returns The function `getPackageInfo` returns an object with three properties: `bundlephobia`,
 * `pkg`, and `gitHub`.
 */
const getPackageInfo = async (req: Request) => {
  try {
    const id = getPackageId(req);
    const [pkg, bundlephobia] = await Promise.all([
      getPkgInfo(id),
      getBundlePhobiaData(id)
    ]);
    const gitHub = (await getRepositoryInfo(pkg)) || null;
    return { bundlephobia, pkg, gitHub };
  } catch (err: any) {
    return err.message;
  }
};

export default getPackageInfo;
