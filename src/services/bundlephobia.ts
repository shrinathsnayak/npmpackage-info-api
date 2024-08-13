import axios, { AxiosResponse } from 'axios';
import { tryCatchWrapper } from '@/utils/error';

/**
 * The function `getBundlePhobiaData` fetches size data for a given package using the BundlePhobia API
 * and handles errors gracefully.
 * @param {string} pkg - The `pkg` parameter in the `getBundlePhobiaData` function is a string that
 * represents the package name for which you want to retrieve data from the BundlePhobia API.
 * @returns The `getBundlePhobiaData` function returns either the data about the package size from the
 * BundlePhobia API if the request is successful, or an object with error details (status and message)
 * if there is an error during the API request.
 */
export const getBundlePhobiaData = tryCatchWrapper(async (pkg: string) => {
  if (!pkg) {
    return {
      status: 400,
      message: 'Package name is required'
    };
  }
  const url = `https://bundlephobia.com/api/size?package=${pkg}`;
  const response: AxiosResponse = await axios.get(url);
  return {
    status: response.status,
    data: response.data
  };
});
