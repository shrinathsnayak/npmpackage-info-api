import { graphQuery, mapGithubData } from '@/mapping/github';
import { base64Decode } from '@/utils/helpers';
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
export const getGitHubInfo = async (owner: string, repoName: string) => {
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
  const readMeData: string | null = await getRepositoryReadMe(owner, repoName);
  const { repository } = response?.data?.data || {};
  return mapGithubData(repository, owner, readMeData);
};

/**
 * This TypeScript function retrieves the README content of a GitHub repository using the GitHub API.
 * @param {string} owner - The `owner` parameter refers to the username or organization that owns the
 * GitHub repository from which you want to retrieve the README file.
 * @param {string} repoName - The `repoName` parameter in the `getRepositoryReadMe` function refers to
 * the name of the repository whose README you want to retrieve from GitHub. It is a string that
 * specifies the name of the repository.
 * @returns The function `getRepositoryReadMe` is returning the decoded content of the README file of a
 * GitHub repository specified by the `owner` and `repoName` parameters. The content is decoded using
 * the `base64Decode` function. If the content is successfully decoded, it is returned; otherwise,
 * `null` is returned.
 */
export const getRepositoryReadMe = async (owner: string, repoName: string) => {
  const url = `https://api.github.com/repos/${owner}/${repoName}/readme`;
  const response: AxiosResponse = await axios.get(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  const { content } = response?.data || {};
  if (content) {
    return base64Decode(content);
  }
  return null;
};
