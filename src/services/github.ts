import axios, { AxiosResponse } from 'axios';
import { graphQuery, mapGithubData } from '@/mapping/github';

/**
 * The function `matchGithubRepo` takes in package information and returns the GitHub repository name
 * if found, otherwise it throws an error.
 * @param info - The `info` parameter is of type `Awaited<ReturnType<typeof getPkgInfo>>`.
 * @returns a string, which is the GitHub repository name.
 */
export function matchGithubRepo(info: any): string {
  const maybeLink = info?.data?.repositoryUrl || info?.data?.homepage;
  if (!maybeLink) {
    throw new Error(`Cannot find repository or homepage for ${info.name}`);
  }
  {
    const regex = /git(?:\+https)?:\/\/github\.com\/(.*)\.git/;
    const match = maybeLink.match(regex);
    if (match) {
      return match[1];
    }
  }
  {
    const regex = /https:\/\/github\.com\/(.*)/;
    const match = maybeLink.match(regex);
    if (match) {
      return match[1];
    }
  }
  throw new Error(`Cannot find github repo for ${info.name}`);
}

/**
 * The `getRepositoryInfo` function retrieves information about a GitHub repository based on a given
 * npm package name.
 * @param {string} npmPkg - The `npmPkg` parameter is a string that represents the name of an npm
 * package.
 * @returns The function `getRepositoryInfo` returns a Promise that resolves to the result of
 * `mapGithubData(repository)`.
 */
export const getRepositoryInfo = async (npmPkg: string) => {
  try {
    const pkgGitUrl = matchGithubRepo(npmPkg);
    if (!pkgGitUrl) {
      console.error(`Cannot find github repo for ${npmPkg}`);
      return;
    }
    const [owner, repo] = pkgGitUrl.split('/');
    const query = graphQuery(owner, repo);
    const url = `https://api.github.com/graphql?repo=${pkgGitUrl}`;
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
  } catch (e) {
    console.error(e);
  }
};
