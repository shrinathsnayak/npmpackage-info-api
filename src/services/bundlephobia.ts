import axios, { AxiosResponse } from 'axios';
import { bundlePhobiaMapping } from '@/mapping/bundlephobia';
import { tryCatchWrapper } from '@/utils/error';
import { createAxiosInstanceWithRetry } from '@/utils/configurations';

// Create axios instance with retry capability
const axiosInstance = createAxiosInstanceWithRetry();

/**
 * The function `getBundlePhobiaData` fetches bundle size information for a specified npm package from
 * the BundlePhobia API.
 * @param {string} pkg - The `pkg` parameter is a string that represents the name of an npm package for
 * which you want to retrieve bundle size information.
 * @returns The function `getBundlePhobiaData` is returning the result of the `bundlePhobiaMapping`
 * function applied to the data received from the BundlePhobia API for the specified package.
 */
export const getBundlePhobiaData = tryCatchWrapper(async (pkg: string) => {
  const url = `https://bundlephobia.com/api/size?package=${pkg}`;
  const response: AxiosResponse = await axiosInstance.get(url);
  return bundlePhobiaMapping(response?.data);
}, 'getBundlePhobiaData');
