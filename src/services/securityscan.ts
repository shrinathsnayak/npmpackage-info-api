import axios, { AxiosResponse } from 'axios';
import { mapScanData } from '@/mapping/securityscan';
import { tryCatchWrapper } from '@/utils/error';
import messages from '@/constants/messages';
import { axiosConfig } from '@/utils/configurations';

// Create axios instance with optimized configuration
const axiosInstance = axios.create(axiosConfig);

/**
 * The function `getSecurityScore` retrieves the security score of a GitHub repository using the
 * Security Scorecards API.
 * @param {string} owner - The `owner` parameter in the `getSecurityScore` function refers to the owner
 * or organization name of the GitHub repository for which you want to retrieve the security score.
 * @param {string} repoName - The `repoName` parameter in the `getSecurityScore` function refers to the
 * name of the GitHub repository for which you want to retrieve the security score.
 * @returns The function `getSecurityScore` is returning the data fetched from the API endpoint
 * `https://api.securityscorecards.dev/projects/github.com/` for the specified
 * `owner` and `repoName`.
 */
export const getSecurityScore = tryCatchWrapper(
  async (owner: string, repoName: string) => {
    if (owner && repoName) {
      const url = `https://api.securityscorecards.dev/projects/github.com/${owner}/${repoName}`;
      const response: AxiosResponse = await axiosInstance.get(url);
      return mapScanData(response?.data);
    } else {
      return {
        status: 400,
        message: messages.errors.OWNER_OR_REPO_MISSING
      };
    }
  },
  'getSecurityScore'
);
