import { Request } from 'express';
import { getAllDailyDownloads, getPkgInfo } from '@/services/npm';
import { getRepositoryInfo } from '@/controllers/github';
import { getBundlePhobiaData } from '@/services/bundlephobia';
import { getSecurityScore } from '@/services/securityscan';
import { FIRST_AVAILABLE_DATE, TODAY_DATE } from '@/constants';
import {
  getMonthlyDownloads,
  getWeeklyDownloads,
  getYearlyDownloads,
  measureTime
} from '@/utils/helpers';
import { getVulnerabilityScore } from '@/services/socket';
import { tryCatchWrapper } from '@/utils/error';
import { requestTimeout } from '@/utils/configurations';

/**
 * The function `getPackageInfo` retrieves information about a package from npm, BundlePhobia, and
 * GitHub based on a query parameter with optimized performance and early return strategy.
 * @param {Request} req - Request object containing information about the HTTP request made by the
 * client. It typically includes properties such as query parameters, headers, body, and other request
 * details.
 * @returns The function `getPackageInfo` is returning an object with information about a package,
 * including npm package info, bundlephobia data, and GitHub repository info. If an error occurs during
 * the process, the function will return the error message. If the query parameter `q` is not provided,
 * it will return a status of 400 and a message indicating that the package was not found.
 */
export const getPackageInfo = tryCatchWrapper(async (req: Request) => {
  const { q }: any = req.query;
  if (!q) {
    return {
      status: 400,
      message: 'Package not found'
    };
  }

  const startTime = Date.now();

  try {
    // Phase 1: Core API calls (npm and bundle) - these are independent and critical
    const [npmResult, bundleResult] = await Promise.allSettled([
      measureTime(`NPM API (${q})`, () => getPkgInfo(q)),
      measureTime(`BundlePhobia API (${q})`, () => getBundlePhobiaData(q))
    ]);

    // Check if package exists early
    if (npmResult.status === 'rejected' && npmResult.reason.message === 'Package not found') {
      return {
        status: 404,
        message: 'Package not found'
      };
    }

    const npm = npmResult.status === 'fulfilled' ? npmResult.value : { error: 'NPM API failed' };
    const bundle = bundleResult.status === 'fulfilled' ? bundleResult.value : { error: 'BundlePhobia API failed' };

    // Phase 2: GitHub info (depends on npm data)
    let gitHub: any = {};
    if (npm?.data?.repositoryUrl) {
      try {
        gitHub = await measureTime(`GitHub API (${q})`, () => getRepositoryInfo(npm));
        if (!gitHub || !gitHub.data) {
          gitHub = { error: 'GitHub API failed - invalid response' };
        }
      } catch (error) {
        gitHub = { error: 'GitHub API failed' };
      }
    }

    // Phase 3: Secondary API calls (security and vulnerability) - these are independent of each other
    const [securityScore, vulnerabilityScore] = await Promise.allSettled([
      measureTime(`Security API (${q})`, () => {
        if (gitHub?.data?.owner && gitHub?.data?.name) {
          return getSecurityScore(gitHub.data.owner, gitHub.data.name);
        }
        return Promise.resolve({ error: 'Security scan failed - no GitHub data' });
      }),
      measureTime(`Vulnerability API (${q})`, () => getVulnerabilityScore(npm?.data?.name, npm?.data?.version))
    ]);

    const totalTime = Date.now() - startTime;

    // Log performance metrics
    console.log(`[PERFORMANCE] Package ${q} completed in ${totalTime}ms`);

    // Return partial data if taking too long (early return strategy)
    if (totalTime > requestTimeout) {
      console.warn(`[PERFORMANCE] Package ${q} took ${totalTime}ms - returning partial data`);
    }

    return {
      npm,
      bundle,
      gitHub,
      securityScore: securityScore.status === 'fulfilled' ? securityScore.value : { error: 'Security scan failed' },
      vulnerabilityScore: vulnerabilityScore.status === 'fulfilled' ? vulnerabilityScore.value : { error: 'Vulnerability scan failed' },
      performance: {
        totalTime,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    console.error(`[ERROR] Package ${q} failed after ${totalTime}ms:`, error.message);

    return {
      status: 500,
      message: error.message || 'Internal server error',
      performance: {
        totalTime,
        timestamp: new Date().toISOString()
      }
    };
  }
}, 'getPackageInfo');

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
export const getPackageDownloads = tryCatchWrapper(
  async (
    packageName = '',
    sinceDate = FIRST_AVAILABLE_DATE,
    endDate = TODAY_DATE
  ) => {
    const allDailyDownloads: any = await getAllDailyDownloads(
      packageName,
      sinceDate,
      endDate
    );

    if (!allDailyDownloads || allDailyDownloads.length === 0) {
      return {
        status: 404,
        message: 'Download data not found!'
      };
    }

    const oneDayValue: boolean = allDailyDownloads.length === 1;
    const downloadsLength = allDailyDownloads.length;

    // Optimize calculations by doing them in a single pass
    let total = 0;
    let lastDay = 0;
    let lastDayPreviousWeek = 0;
    let lastWeek = 0;
    let previousWeek = 0;
    let lastMonth = 0;
    let previousMonth = 0;
    let lastYear = 0;
    let previousYear = 0;

    // Calculate totals in a single pass
    for (let i = 0; i < downloadsLength; i++) {
      const download = allDailyDownloads[i].downloads;
      total += download;

      if (oneDayValue) {
        lastDay = download;
        lastDayPreviousWeek = download;
        lastWeek = download;
        previousWeek = download;
        lastMonth = download;
        previousMonth = download;
        lastYear = download;
        previousYear = download;
      } else {
        // Last day
        if (i === downloadsLength - 1) {
          lastDay = download;
        }
        // Last day previous week (8 days ago)
        if (i === downloadsLength - 8) {
          lastDayPreviousWeek = download;
        }
        // Last week (last 7 days)
        if (i >= downloadsLength - 7) {
          lastWeek += download;
        }
        // Previous week (7-14 days ago)
        if (i >= downloadsLength - 14 && i < downloadsLength - 7) {
          previousWeek += download;
        }
        // Last month (last 30 days)
        if (i >= downloadsLength - 30) {
          lastMonth += download;
        }
        // Previous month (30-60 days ago)
        if (i >= downloadsLength - 60 && i < downloadsLength - 30) {
          previousMonth += download;
        }
        // Last year (last 365 days)
        if (i >= downloadsLength - 365) {
          lastYear += download;
        }
        // Previous year (365-730 days ago)
        if (i >= downloadsLength - 730 && i < downloadsLength - 365) {
          previousYear += download;
        }
      }
    }

    // Calculate aggregated data in parallel
    const [weekly, monthly, yearly] = await Promise.all([
      Promise.resolve(
        oneDayValue ? allDailyDownloads : getWeeklyDownloads(allDailyDownloads)
      ),
      Promise.resolve(
        oneDayValue ? allDailyDownloads : getMonthlyDownloads(allDailyDownloads)
      ),
      Promise.resolve(
        oneDayValue ? allDailyDownloads : getYearlyDownloads(allDailyDownloads)
      )
    ]);

    return {
      status: 200,
      data: {
        total,
        lastDay,
        lastDayPreviousWeek,
        lastWeek,
        previousWeek,
        lastMonth,
        previousMonth,
        lastYear,
        previousYear,
        weekly,
        monthly,
        yearly
      }
    };
  },
  'getPackageDownloads'
);
