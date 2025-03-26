import axios, { AxiosResponse } from 'axios';
import {
  graphQuery,
  graphQueryForVulnerabilities,
  mapGithubData
} from '@/mapping/github';
import { tryCatchWrapper } from '@/utils/error';
import { base64Decode } from '@/utils/helpers';
import { groupVulnerabilitiesBySeverity } from '@/controllers/github';

/**
 * The function `getGitHubInfo` retrieves information about a GitHub repository using a GraphQL query.
 * @param {string} owner - The `owner` parameter refers to the username or organization name that owns
 * the GitHub repository you want to retrieve information about.
 * @param {string} repoName - The `repoName` parameter in the `getGitHubInfo` function refers to the
 * name of the GitHub repository you want to retrieve information for.
 * @returns The function `getGitHubInfo` is returning the mapped data from the GitHub repository
 * specified by the owner and repoName parameters.
 */
export const getGitHubInfo = tryCatchWrapper(
  async (owner: string, repoName: string, loadReadme = false) => {
    if (!owner && !repoName) {
      return null;
    }
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
    const readMeData: string | null =
      loadReadme && (await getRepositoryReadMe(owner, repoName));
    const { repository } = response?.data?.data || {};
    return mapGithubData(repository, owner, readMeData);
  }
);

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
export const getRepositoryReadMe = tryCatchWrapper(
  async (owner: string, repoName: string) => {
    if (!owner && !repoName) {
      return null;
    }
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
  }
);

/**
 * This TypeScript function retrieves contributors of a GitHub repository using the GitHub API and
 * returns relevant contributor information.
 * @param {string} owner - The `owner` parameter refers to the username or organization name that owns
 * the GitHub repository from which you want to retrieve contributors.
 * @param {string} repoName - The `repoName` parameter in the `getContributors` function refers to the
 * name of the repository for which you want to retrieve the contributors.
 * @returns The function `getContributors` returns an array of objects with properties `name`, `url`,
 * `id`, `contributions`, and `profile_url` for each contributor of the specified GitHub repository. If
 * there is no data retrieved from the API call, it returns `null`.
 */
export const getContributors = tryCatchWrapper(
  async (
    owner: string,
    repoName: string,
    page: number = 1,
    limit: number = 20
  ) => {
    const url = `https://api.opensauced.pizza/v2/repos/${owner}/${repoName}/contributors?page=${page}&limit=${limit}`;
    const response: AxiosResponse = await axios.get(url);
    const { data } = response || {};
    if (data) {
      return data?.data?.map((item: any) => ({
        name: item?.login,
        url: item?.avatar_url,
        id: item?.id,
        contributions: item?.total_contributions
      }));
    }
    return null;
  }
);

/**
 * Fetches the vulnerabilities of a given npm package from GitHub's GraphQL API.
 *
 * @param packageName - The name of the npm package to fetch vulnerabilities for.
 * @returns An object containing the status of the response and the grouped vulnerabilities by severity.
 *
 * @throws Will throw an error if the request fails.
 */
export const getPackageVulnerabilities = tryCatchWrapper(
  async (packageName: string, version: string) => {
    const query: string = graphQueryForVulnerabilities(packageName);
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

    return {
      status: response?.status,
      data: groupVulnerabilitiesBySeverity(response?.data, version)
    };
  }
);
