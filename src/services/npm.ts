import { AxiosResponse } from 'axios';
import { mapNpmData, mapNpmSearchData } from '@/mapping/npm';
import { tryCatchWrapper } from '@/utils/error';
import { createAxiosInstanceWithRetry, axiosConfig } from '@/utils/configurations';
import { getListOfRangesSinceStart } from '@/utils/helpers';

// Create axios instance with retry capability
const axiosInstance = createAxiosInstanceWithRetry();

/**
 * The function `getPkgInfo` fetches information about a specified npm package and version from the npm
 * registry.
 * @param {string} pkg - The `pkg` parameter is a string that represents the name of an npm package for
 * which you want to retrieve information.
 * @param [version=latest] - The `version` parameter in the `getPkgInfo` function is a string parameter
 * with a default value of `'latest'`. This parameter allows you to specify the version of the package
 * you want to retrieve information for. If no version is provided, it will default to fetching the
 * latest version of
 * @returns The function `getPkgInfo` is returning the result of the `mapNpmData` function applied to
 * the data received from the npm registry API for the specified package and version.
 */
export const getPkgInfo = tryCatchWrapper(
  async (pkg: string, version = 'latest') => {
    const url = `https://r.cnpmjs.org/${encodeURIComponent(pkg)}/${version}`;
    const response: AxiosResponse = await axiosInstance.get(url);

    // Check if package exists
    if (!response.data || response.data.error) {
      throw new Error('Package not found');
    }

    return mapNpmData(response.data);
  }
);

/**
 * The `searchPackage` function in TypeScript searches for npm packages using the npm registry API and
 * returns the search results.
 * @param {string} pkg - The `pkg` parameter is a string that represents the package name you want to
 * search for on the npm registry.
 * @param {number} [size=5] - The `size` parameter in the `searchPackage` function is used to specify
 * the number of search results to be returned. By default, if the `size` parameter is not provided
 * when calling the function, it will return 5 search results. However, you can override this default
 * behavior by providing
 * @returns The `searchPackage` function returns the result of mapping the npm search data retrieved
 * from the npm registry API.
 */
export const searchPackage = tryCatchWrapper(
  async (pkg: string, size: number = 10, from: number = 0) => {
    const url = `https://registry.npmmirror.com/-/v1/search?text=${pkg}&size=${size}&from=${from}`;
    const response: AxiosResponse = await axiosInstance.get(url);
    return mapNpmSearchData(response?.data);
  },
  'searchPackage'
);

/**
 * Fallback function to fetch download counts using npm registry API
 * This is used when the primary fetchDownloadCounts method times out
 */
const fetchDownloadCountsFallback = tryCatchWrapper(
  async (packageName: string, sinceDate: string, endDate: string) => {
    try {
      const ranges = getListOfRangesSinceStart(sinceDate, endDate);

      // Fetch data for all ranges in parallel
      const rangesResponses = await Promise.all(
        ranges.map(async ({ start, end }) => {
          try {
            const response = await axiosInstance.get(
              `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`
            );
            return response.data;
          } catch (error) {
            console.warn(`Failed to fetch range ${start}:${end} for ${packageName}:`, error.message);
            return { downloads: [] };
          }
        })
      );

      // Combine all downloads from different ranges
      const allDownloads = rangesResponses.reduce((acc: any[], { downloads }) => {
        return [...acc, ...(downloads || [])];
      }, []);

      // Find the last day with data
      const lastDayWithData = allDownloads.findLastIndex(({ downloads }) => downloads > 0);
      const allDownloadsUntilLastDayWithData = allDownloads.slice(0, lastDayWithData + 1);

      // Remove all leading zeros
      const firstNonZeroIndex = allDownloadsUntilLastDayWithData.findIndex((p) => p.downloads !== 0);
      if (firstNonZeroIndex > 0) {
        return { downloads: allDownloadsUntilLastDayWithData.slice(firstNonZeroIndex) };
      }

      return { downloads: allDownloadsUntilLastDayWithData };
    } catch (error) {
      console.error(`Fallback fetch failed for ${packageName}:`, error.message);
      return { downloads: [] };
    }
  },
  'fetchDownloadCountsFallback'
);

/* The `getAllDailyDownloads` function is a function that retrieves daily download data for a specified
npm package within a given date range. */
export const getAllDailyDownloads = tryCatchWrapper(
  async (packageName: string, sinceDate: string, endDate: string) => {
    let rangesResponses: any;

    try {
      // Try primary method first
      rangesResponses = await fetchDownloadCounts(packageName, sinceDate, endDate);

      // Check if we got valid data
      if (!rangesResponses || !rangesResponses.downloads || !Array.isArray(rangesResponses.downloads) || rangesResponses.downloads.length === 0) {
        throw new Error('No data from primary method');
      }
    } catch (primaryError) {
      console.warn(`Primary download fetch failed for ${packageName}, trying fallback:`, primaryError.message);

      // Use fallback method
      try {
        rangesResponses = await fetchDownloadCountsFallback(packageName, sinceDate, endDate);
      } catch (fallbackError) {
        console.error(`Both primary and fallback methods failed for ${packageName}:`, fallbackError.message);
        return [];
      }
    }

    // Handle case where no data is returned
    if (
      !rangesResponses ||
      !rangesResponses.downloads ||
      !Array.isArray(rangesResponses.downloads)
    ) {
      console.warn(`No download data found for package: ${packageName}`);
      return [];
    }

    const allDownloads: any = rangesResponses.downloads;

    // Handle empty downloads array
    if (allDownloads.length === 0) {
      return [];
    }

    const lastDayWithData = allDownloads.findLastIndex(
      ({ downloads }: any) => downloads > 0
    );

    // If no days with data found, return empty array
    if (lastDayWithData === -1) {
      return [];
    }

    const allDownloadsUntilLastDayWithData = allDownloads.slice(
      0,
      lastDayWithData + 1
    );

    const firstNonZeroIndex = allDownloadsUntilLastDayWithData.findIndex(
      (p: any) => p.downloads !== 0
    );

    if (firstNonZeroIndex > 0) {
      return allDownloadsUntilLastDayWithData.slice(firstNonZeroIndex);
    }

    return allDownloadsUntilLastDayWithData;
  },
  'getAllDailyDownloads'
);

/* The `fetchDownloadCounts` function is responsible for fetching daily download counts for a specified
npm package within a given date range. */
const fetchDownloadCounts = tryCatchWrapper(
  async (packageName: string, sinceDate: string, endDate: string) => {
    // Create a custom axios instance with shorter timeout for this specific endpoint
    const axios = require('axios');
    const quickAxiosInstance = axios.create({
      ...axiosConfig,
      timeout: 5000 // 5 seconds timeout instead of 10
    });

    try {
      const { data } = await quickAxiosInstance.get(
        `https://npm-stat.com/api/download-counts?package=${packageName}&from=${sinceDate}&until=${endDate}`
      );

      const packageData = data?.[packageName];

      const result = [];
      const current = new Date(sinceDate);
      const end = new Date(endDate);

      while (current <= end) {
        const day = current.toISOString().split('T')[0];
        result.push({
          downloads: packageData?.[day] ?? 0,
          day
        });
        current.setDate(current.getDate() + 1);
      }

      return { downloads: result };
    } catch (fallbackError) {
      console.warn(
        `Failed to fetch download counts for ${packageName}:`,
        fallbackError.message
      );
      throw fallbackError; // Re-throw to trigger fallback
    }
  },
  'fetchDownloadCounts'
);
