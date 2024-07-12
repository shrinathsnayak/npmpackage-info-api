import axios, { AxiosResponse } from 'axios';
import { mapNpmData, mapNpmSearchData } from '@/mapping/npm';
import { getListOfRangesSinceStart } from '@/utils/helpers';

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
export const getPkgInfo = async (pkg: string, version = 'latest') => {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(pkg)}/${version}`;
    const response: AxiosResponse = await axios.get(url);
    return mapNpmData(response.data);
  } catch (e: any) {
    return {
      error: e?.response?.status,
      message: e?.response?.data?.error?.message
    };
  }
};

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
export const searchPackage = async (pkg: string, size: number = 5) => {
  try {
    const url = `http://registry.npmjs.com/-/v1/search?text=${pkg}&size=${size}`;
    const response: AxiosResponse = await axios.get(url);
    return mapNpmSearchData(response?.data);
  } catch (e: any) {
    return {
      error: e?.response?.status,
      message: e?.response?.data?.error?.message
    };
  }
};

export const getAllDailyDownloads = async (
  packageName: string,
  sinceDate: string,
  endDate: string
) => {
  const ranges = getListOfRangesSinceStart(sinceDate, endDate);
  const rangesResponses = await Promise.all(
    ranges.map(({ start, end }) => {
      return axios.get(
        `https://api.npmjs.org/downloads/range/${start}:${end}/${packageName}`
      );
    })
  );
  const allDownloads: any = rangesResponses.reduce(
    (acc: any[], { data }: any) => {
      return [...acc, ...data.downloads];
    },
    []
  );

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
};
