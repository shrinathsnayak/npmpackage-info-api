import { Request } from 'express';
import { getPkgInfo } from '@/services/npm';
import { getRepositoryInfo } from '@/controllers/github';
import { getBundlePhobiaData } from '@/services/bundlephobia';
import { getSecurityScore } from '@/services/securityscan';
import { GitHubMappingType } from '@/types/github';

/**
 * The function `getPackageInfo` retrieves information about a package from npm, BundlePhobia, and
 * GitHub based on a query parameter.
 * @param {Request} req - Request object containing information about the HTTP request made by the
 * client. It typically includes properties such as query parameters, headers, body, and other request
 * details.
 * @returns The function `getPackageInfo` is returning an object with information about a package,
 * including npm package info, bundlephobia data, and GitHub repository info. If an error occurs during
 * the process, the function will return the error message. If the query parameter `q` is not provided,
 * it will return a status of 400 and a message indicating that the package was not found.
 */
const getPackageInfo = async (req: Request) => {
  try {
    const { q }: any = req.query;
    if (!q) {
      return {
        status: 400,
        message: 'Package not found'
      };
    }
    const [pkg, bundlephobia] = await Promise.all([
      getPkgInfo(q),
      getBundlePhobiaData(q)
    ]);
    const gitHub: any = (await getRepositoryInfo(pkg)) ?? {};
    const securityScore: any = (await getSecurityScore(gitHub?.data?.owner, gitHub?.data?.name)) || null;
    return { npm: pkg, bundle: bundlephobia, gitHub, securityScore };
  } catch (err: any) {
    return err.message;
  }
};

export default getPackageInfo;
