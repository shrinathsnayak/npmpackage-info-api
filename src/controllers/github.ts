import { getGitHubInfo } from '@/services/github';
import { tryCatchWrapper } from '@/utils/error';

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
    console.error(`Cannot find repository or homepage for ${info.name}`);
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
  return '';
}

/**
 * The `getRepositoryInfo` function retrieves information about a GitHub repository based on a given
 * npm package name.
 * @param {string} npmPkg - The `npmPkg` parameter is a string that represents the name of an npm
 * package.
 * @returns The function `getRepositoryInfo` returns a Promise that resolves to the result of
 * `mapGithubData(repository)`.
 */
export const getRepositoryInfo = tryCatchWrapper(async (npmPkg: string) => {
  const pkgGitUrl = matchGithubRepo(npmPkg);
  if (!pkgGitUrl) {
    console.error(`Cannot find github repo for ${npmPkg}`);
    return;
  }
  const [owner, repo] = pkgGitUrl.split('/');
  return getGitHubInfo(owner, repo);
});

/**
 * Groups vulnerabilities by their severity level.
 *
 * @param response - The response object containing security vulnerabilities data.
 * @returns An object where the keys are severity levels and the values are arrays of vulnerabilities.
 *
 * The structure of the returned object is:
 * {
 *   "severityLevel1": [
 *     {
 *       vulnerableVersionRange: string,
 *       severity: string,
 *       description: string,
 *       references: string[]
 *     },
 *     ...
 *   ],
 *   "severityLevel2": [
 *     ...
 *   ],
 *   ...
 * }
 */
export const groupVulnerabilitiesBySeverity = (response: any) => {
  const groupedVulnerabilities =
    response?.data?.securityVulnerabilities?.edges?.reduce(
      (acc: Record<string, any[]>, { node }: { node: any }) => {
        const { vulnerableVersionRange, severity, advisory } = node;

        if (!acc[severity]) {
          acc[severity] = [];
        }

        const referenceUrls = advisory?.references.map(
          (ref: { url: string }) => ref?.url
        );

        acc[severity].push({
          vulnerableVersionRange,
          severity,
          description: advisory?.description,
          references: referenceUrls
        });

        return acc;
      },
      {}
    );

  return groupedVulnerabilities;
};
