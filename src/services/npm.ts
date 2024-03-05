import { mapNpmData, mapNpmSearchData } from '@/mapping/npm';
import axios, { AxiosResponse } from 'axios';

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
  } catch (e) {
    console.error(e);
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
  } catch (e) {
    console.error(e);
  }
};
