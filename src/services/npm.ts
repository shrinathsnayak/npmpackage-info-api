import axios, { AxiosResponse } from 'axios';
import { mapNpmData, mapNpmSearchData } from '@/mapping/npm';
import { getListOfRangesSinceStart } from '@/utils/helpers';
import { tryCatchWrapper } from '@/utils/error';

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
    const response: AxiosResponse = await axios.get(url);
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
    const response: AxiosResponse = await axios.get(url);
    return mapNpmSearchData(response?.data);
  }
);

/* The `getAllDailyDownloads` function is a function that retrieves daily download data for a specified
npm package within a given date range. */
export const getAllDailyDownloads = tryCatchWrapper(
  async (packageName: string, sinceDate: string, endDate: string) => {
    const rangesResponses: any = await fetchDownloadCounts(
      packageName,
      sinceDate,
      endDate
    );
    const allDownloads: any = rangesResponses?.downloads;
    const lastDayWithData = allDownloads?.findLastIndex(
      ({ downloads }: any) => downloads > 0
    );
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
  }
);

/* The `fetchDownloadCounts` function is responsible for fetching daily download counts for a specified
npm package within a given date range. */
const fetchDownloadCounts = tryCatchWrapper(
  async (packageName: string, sinceDate: string, endDate: string) => {
    try {
      const response = await axios.get(
        `https://npm-stat.com/api/download-counts?package=${packageName}&from=${sinceDate}&until=${endDate}`
      );
      const packageDownloadCount = response.data?.[packageName];
      return {
        downloads: Object.keys(packageDownloadCount).map((key) => ({
          downloads: packageDownloadCount[key],
          day: key
        }))
      };
    } catch (error) {
      try {
        const ranges = getListOfRangesSinceStart(sinceDate, endDate);
        const response = await Promise.all(
          ranges.map(({ start, end }) =>
            axios.get(
              `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`
            )
          )
        );
        return {
          downloads: response.map((res) => ({
            downloads: res.data.downloads,
            day: res.data.start
          }))
        };
      } catch (fallbackError) {
        return [];
      }
    }
  }
);
