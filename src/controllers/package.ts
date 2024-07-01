import { Request } from 'express';
import { getAllDailyDownloads, getPkgInfo } from '@/services/npm';
import { getRepositoryInfo } from '@/controllers/github';
import { getBundlePhobiaData } from '@/services/bundlephobia';
import { getSecurityScore } from '@/services/securityscan';
import { FIRST_AVAILABLE_DATE, TODAY_DATE } from '@/constants';
import {
  getMonthlyDownloads,
  getSumOfDownloads,
  getWeeklyDownloads,
  getYearlyDownloads
} from '@/utils/helpers';

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
export const getPackageInfo = async (req: Request) => {
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
    const securityScore: any =
      (await getSecurityScore(gitHub?.data?.owner, gitHub?.data?.name)) || null;
    return { npm: pkg, bundle: bundlephobia, gitHub, securityScore };
  } catch (err: any) {
    return err.message;
  }
};

/**
 * The function `getPackageDownloads` retrieves and calculates various statistics related to package
 * downloads over different time periods.
 * @param [packageName] - The `packageName` parameter is the name of the package for which you want to
 * retrieve download statistics. If no package name is provided, the function will return download
 * statistics for all packages.
 * @param sinceDate - The `sinceDate` parameter in the `getPackageDownloads` function represents the
 * starting date from which you want to retrieve package download data. It is set to a constant named
 * `FIRST_AVAILABLE_DATE` in the function signature. This date indicates the earliest date for which
 * download data is available for the specified
 * @param endDate - The `endDate` parameter in the `getPackageDownloads` function represents the date
 * until which you want to fetch the package downloads data. By default, it is set to `TODAY_DATE`,
 * which means it will fetch the downloads data up to the current date.
 * @returns The `getPackageDownloads` function is returning an object.
 */
export const getPackageDownloads = async (
  packageName = '',
  sinceDate = FIRST_AVAILABLE_DATE,
  endDate = TODAY_DATE,
  options = {} as any
) => {
  const allDailyDownloads: any = await getAllDailyDownloads(
    packageName,
    sinceDate,
    endDate
  );
  if (allDailyDownloads) {
    return {
      status: 200,
      data: {
        total: getSumOfDownloads(allDailyDownloads),
        lastDay: allDailyDownloads[allDailyDownloads.length - 1]?.downloads,
        lastDayPreviousWeek:
          allDailyDownloads[allDailyDownloads.length - 8]?.downloads,
        lastWeek: getSumOfDownloads(allDailyDownloads.slice(-7)),
        previousWeek: getSumOfDownloads(allDailyDownloads.slice(-14, -7)),
        lastMonth: getSumOfDownloads(allDailyDownloads.slice(-30)),
        previousMonth: getSumOfDownloads(allDailyDownloads.slice(-60, -30)),
        lastYear: getSumOfDownloads(allDailyDownloads.slice(-365)),
        previousYear: getSumOfDownloads(allDailyDownloads.slice(-730, -365)),
        weekly: getWeeklyDownloads(allDailyDownloads),
        monthly: getMonthlyDownloads(allDailyDownloads),
        yearly: getYearlyDownloads(allDailyDownloads),
        ...(options?.dailyDownloads && { allDailyDownloads })
      }
    };
  } else {
    return {
      status: 404,
      message: 'Download data not found!'
    };
  }
};
