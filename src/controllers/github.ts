import { graphQuery, mapGithubData } from '@/mapping/github';
import axios, { AxiosResponse } from 'axios';

/**
 * The function `getGitHubInfo` retrieves information about a GitHub repository using a GraphQL query.
 * @param {string} owner - The `owner` parameter refers to the username or organization name that owns
 * the GitHub repository you want to retrieve information about.
 * @param {string} repoName - The `repoName` parameter in the `getGitHubInfo` function refers to the
 * name of the GitHub repository you want to retrieve information for.
 * @returns The function `getGitHubInfo` is returning the mapped data from the GitHub repository
 * specified by the owner and repoName parameters.
 */
const getGitHubInfo = async (owner: string, repoName: string) => {
  const query: string = graphQuery(owner, repoName);
  const url = `https://api.github.com/graphql`;
  const response: AxiosResponse = await axios.post(
    url,
    { query },
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );
  const { repository } = response?.data?.data || {};
  return mapGithubData(repository);
};

export default getGitHubInfo;
