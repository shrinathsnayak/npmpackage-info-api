import { getGitHubInfo } from '@/services/github';

/**
 * This TypeScript function extracts the GitHub repository name from a given object containing
 * repository information.
 * @param {any} info - The `info` parameter is an object that contains data related to a repository. It
 * is expected to have a `data` property which in turn may have a `repositoryUrl` or `homepage`
 * property. The function `matchGithubRepo` tries to extract the GitHub repository name from the
 * provided information
 * @returns The function `matchGithubRepo` returns a string that represents the GitHub repository name
 * extracted from the provided `info` object. If the GitHub repository URL is found in the `info`
 * object, it extracts the repository name from the URL using regular expressions and returns it. If
 * the URL is not found or the extraction fails, it throws an error indicating that the GitHub
 * repository could not be found for the
 */
export function matchGithubRepo(info: any): string {
  const maybeLink = info?.data?.repositoryUrl || info?.data?.homepage;
  if (!maybeLink) {
    throw new Error(`Cannot find repository or homepage for ${info.name}`);
  }
  {
    const regex = /git(?:\+https|\+ssh)?:\/\/(?:git@)?github\.com\/(.*)\.git/;
    const match = maybeLink.match(regex);
    if (match) {
      return match[1]?.replace(/\.git$/, '');
    }
  }
  {
    const regex = /https:\/\/github\.com\/(.*)/;
    const match = maybeLink.match(regex);
    if (match) {
      return match[1]?.replace(/\.git$/, '');
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
    return getGitHubInfo(owner, repo);
  } catch (e) {
    console.error(e);
  }
};
