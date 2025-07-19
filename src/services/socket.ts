import axios, { AxiosResponse } from 'axios';
import {
  getTransformedAlerts,
  getTransformedScore,
  getRandomApiKey
} from '@/utils/helpers';
import { tryCatchWrapper } from '@/utils/error';
import messages from '@/constants/messages';
import { createAxiosInstanceWithRetry } from '@/utils/configurations';

// Create axios instance with retry capability
const axiosInstance = createAxiosInstanceWithRetry();

/**
 * The function `getAPIKey` generates a random API key from an array and encodes it using Base64.
 * @returns The function `getAPIKey` is returning a string that starts with "Basic " followed by the
 * Base64 encoded value of the apiKey concatenated with itself using a colon as a separator.
 */
const getAPIKey = (): string => {
  const API_KEYS_ARRAY: string[] = [process.env.SOCKET_DEV_API_KEY_1 || ''];
  const apiKey: string = getRandomApiKey(API_KEYS_ARRAY);
  return `Basic ${Buffer.from(`${apiKey}:${apiKey}`).toString('base64')}`;
};

/**
 * The function `getVulnerabilityScore` retrieves vulnerability score for a given package and version
 * from an API.
 * @param {string} packageName - The `packageName` parameter refers to the name of the npm package for
 * which you want to retrieve the vulnerability score.
 * @param {string} version - The `version` parameter in the `getVulnerabilityScore` function refers to
 * the specific version of the package for which you want to retrieve the vulnerability score. This
 * version number is used to fetch vulnerability information for that particular version of the package
 * from the API.
 * @returns The `getVulnerabilityScore` function returns either the transformed vulnerability score
 * data obtained from the API response, or an object containing error information such as the status
 * code and error message if an error occurs during the API request.
 */
export const getVulnerabilityScore = tryCatchWrapper(
  async (packageName: string, version: string) => {
    if (packageName && version) {
      const URL = `https://api.socket.dev/v0/npm/${packageName}/${version}`;
      const scoreResponse: AxiosResponse = await axiosInstance.get(
        `${URL}/score`,
        {
          headers: {
            accept: 'application/json',
            Authorization: getAPIKey()
          }
        }
      );
      return {
        status: 200,
        data: getTransformedScore(scoreResponse?.data)
      };
    } else {
      return {
        status: 400,
        message: messages.errors.PROJECT_NAME_OR_VERSION_MISSING
      };
    }
  },
  'getVulnerabilityScore'
);

/**
 * This TypeScript function fetches alerts for a specific npm package and version from an API and
 * returns transformed alerts data or error information.
 * @param {string} packageName - The `packageName` parameter is a string that represents the name of
 * the npm package for which you want to retrieve alerts.
 * @param {string} version - The `version` parameter in the `getAlerts` function represents the version
 * number of the package for which you want to retrieve alerts. It is used to specify the specific
 * version of the package for which you are fetching the alerts.
 * @returns The `getAlerts` function returns either the transformed alerts data fetched from the API or
 * an object containing error details such as the status code and error message if an error occurs
 * during the API request.
 */
export const getAlerts = tryCatchWrapper(
  async (packageName: string, version: string) => {
    const URL = `https://api.socket.dev/v0/npm/${packageName}/${version}/issues`;
    const alertsResponse: AxiosResponse = await axiosInstance.get(URL, {
      headers: {
        accept: 'application/json',
        Authorization: getAPIKey()
      }
    });
    return getTransformedAlerts(alertsResponse?.data);
  },
  'getAlerts'
);
