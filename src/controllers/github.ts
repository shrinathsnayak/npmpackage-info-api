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
 * The function `groupVulnerabilitiesBySeverity` takes a response object, extracts security
 * vulnerabilities data, and groups them by severity level.
 * @param {any} response - The `groupVulnerabilitiesBySeverity` function takes a response object as a
 * parameter. The response object is expected to have a specific structure with nested properties to
 * extract security vulnerabilities data. The function then processes this data to group
 * vulnerabilities by severity level and returns an object where vulnerabilities are categorized based
 * on their
 * @returns The function `groupVulnerabilitiesBySeverity` returns an object where vulnerabilities are
 * grouped by severity. Each severity level is a key in the object, and the value associated with each
 * key is an array of vulnerability objects. Each vulnerability object contains information such as
 * vulnerable version range, severity, description, references, first patched version, CVSS score, and
 * identifiers.
 */
export const groupVulnerabilitiesBySeverity = (response: any) => {
  const groupedVulnerabilities =
    response?.data?.securityVulnerabilities?.edges?.reduce(
      (acc: Record<string, any[]>, { node }: { node: any }) => {
        const {
          vulnerableVersionRange,
          severity,
          advisory,
          firstPatchedVersion,
          cvss,
          identifiers,
        } = node;

        if (!acc[severity]) {
          acc[severity] = [];
        }

        const referenceUrls = advisory?.references
          .map((ref: { url: string }) => ref?.url)
          .filter((url: string) => url !== advisory?.permalink);

        const vulnerabilityIdentifiers = identifiers?.map(
          (identifier: { type: string; value: string }) => ({
            type: identifier.type,
            value: identifier.value
          })
        );

        acc[severity].push({
          severity,
          summary: advisory?.summary,
          cvssScore: cvss?.score,
          vulnerableVersionRange,
          identifiers: vulnerabilityIdentifiers,
          description: advisory?.description,
          references: referenceUrls,
          firstPatchedVersion: firstPatchedVersion?.identifier,
        });

        return acc;
      },
      {}
    );

  return groupedVulnerabilities;
};
