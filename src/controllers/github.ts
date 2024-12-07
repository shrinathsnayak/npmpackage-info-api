import semver from 'semver';
import { VULNERABILITIES_ORDER } from '@/constants';
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
  const maybeLink = info?.data?.repositoryUrl || info?.data?.repository?.url || info?.data?.homepage;
  if (!maybeLink) {
    return '';
  }

  // Common regex pattern for extracting GitHub repository paths
  const regex =
    /(?:git(?:\+https|\+ssh)?:\/\/(?:git@)?|https:\/\/)github\.com\/([^/]+\/[^/]+)(?:\.git)?/;
  const match = maybeLink.match(regex);

  if (match) {
    return match[1];
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
export const getRepositoryInfo = tryCatchWrapper(async (npmPkg: any) => {
  const pkgGitUrl = matchGithubRepo(npmPkg);
  if (!pkgGitUrl) {
    return;
  }
  const [owner, repo] = pkgGitUrl.split('/');
  return getGitHubInfo(owner, repo, !npmPkg?.data?.readMe);
});

/**
 * The function `groupVulnerabilitiesBySeverity` categorizes security vulnerabilities by severity and
 * returns them sorted according to a predefined order.
 * @param {any} response - The `response` parameter in the `groupVulnerabilitiesBySeverity` function is
 * expected to be an object containing data related to security vulnerabilities. It likely includes
 * information about security vulnerabilities such as vulnerable version ranges, severity levels,
 * advisories, identifiers, references, CVSS scores, publication dates, and
 * @param {string} latestVersion - The `latestVersion` parameter in the
 * `groupVulnerabilitiesBySeverity` function is a string that represents the most recent version of a
 * software or application. This parameter is used to compare against vulnerable version ranges to
 * determine if a vulnerability exists in the latest version.
 * @returns The function `groupVulnerabilitiesBySeverity` returns an object with two properties:
 * 1. `stableVersion`: The stable version obtained from the `getStableVersion` function.
 * 2. `sortedVulnerabilities`: An object where each key represents a severity level (e.g., "LOW",
 * "MODERATE", "HIGH", "CRITICAL") and the value is an array of vulnerabilities with that severity.
 */
export const groupVulnerabilitiesBySeverity = (
  response: any,
  latestVersion: string
) => {
  const groupedVulnerabilities =
    response?.data?.securityVulnerabilities?.edges?.reduce(
      (acc: Record<string, any[]>, { node }: { node: any }) => {
        const {
          vulnerableVersionRange,
          severity,
          advisory,
          firstPatchedVersion,
          identifiers
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
          permalink: advisory?.permalink,
          summary: advisory?.summary,
          cvssScore: advisory?.cvss?.score,
          vulnerableVersionRange,
          identifiers: vulnerabilityIdentifiers,
          description: advisory?.description,
          references: referenceUrls,
          publishedAt: advisory?.publishedAt,
          updatedAt: advisory?.updatedAt,
          firstPatchedVersion: firstPatchedVersion?.identifier
        });

        return acc;
      },
      {}
    );

  const stableVersion = getStableVersion(response, latestVersion);

  const sortedVulnerabilities: Record<string, any[]> = {};
  VULNERABILITIES_ORDER.forEach((severity) => {
    if (groupedVulnerabilities[severity]) {
      sortedVulnerabilities[severity] = groupedVulnerabilities[severity];
    }
  });

  return { stableVersion, sortedVulnerabilities };
};

/**
 * The function `getStableVersion` determines the stable version of a software package based on
 * security vulnerabilities and the latest version available.
 * @param {any} response - The `response` parameter is expected to be an object containing data with a
 * specific structure. It should have a `data` property which in turn should have a
 * `securityVulnerabilities` property that contains an array of objects under the `edges` key. This
 * function is designed to extract information from
 * @param {string} latestVersion - The `latestVersion` parameter in the `getStableVersion` function
 * represents the most recent version of a software package or library. This version is used as the
 * starting point to determine the stable version considering any security vulnerabilities and patches.
 * @returns The function `getStableVersion` returns a string value representing the stable version of a
 * software package based on the provided response data and the latest version available. If no stable
 * version is found, it returns `null`.
 */
const getStableVersion = (
  response: any,
  latestVersion: string
): string | null => {
  const vulnerabilities = response?.data?.securityVulnerabilities?.edges || [];

  let stableVersion = latestVersion;

  vulnerabilities.forEach(({ node }: { node: any }) => {
    const { vulnerableVersionRange, firstPatchedVersion } = node;

    // Check if a firstPatchedVersion exists and if it's higher than the current stableVersion
    if (firstPatchedVersion?.identifier) {
      if (semver.gt(firstPatchedVersion.identifier, stableVersion)) {
        stableVersion = firstPatchedVersion.identifier;
      }
    } else {
      // If no firstPatchedVersion, calculate a patched version from the vulnerable range
      const nextStable = calculateNextStableVersion(vulnerableVersionRange);
      if (nextStable && semver.gt(nextStable, stableVersion)) {
        stableVersion = nextStable;
      }
    }
  });

  return stableVersion;
};

/**
 * The function `calculateNextStableVersion` takes a vulnerable version range as input and returns the
 * next stable version after the highest upper bound in the range.
 * @param {string} vulnerableVersionRange - The `vulnerableVersionRange` parameter is a string
 * representing a range of versions that are considered vulnerable. This function calculates the next
 * stable version based on the upper bounds of the version ranges provided.
 * @returns The function `calculateNextStableVersion` returns a string representing the next stable
 * version after the vulnerable version range provided as input. If there is a valid maximum version in
 * the range, it increments that version by a patch level and returns the updated version. If no valid
 * maximum version is found, it returns `null`.
 */
export const calculateNextStableVersion = (
  vulnerableVersionRange: string
): string | null => {
  if (!vulnerableVersionRange) {
    return null;
  }

  const ranges = vulnerableVersionRange
    .split('||')
    .map((range) => range.trim());
  let maxVersion = null;

  for (const range of ranges) {
    const upperBound = semver.validRange(range)?.split(' ')[1]; // Get the upper limit
    if (upperBound && (!maxVersion || semver.gt(upperBound, maxVersion))) {
      maxVersion = upperBound;
    }
  }

  if (maxVersion) {
    return semver.inc(maxVersion, 'patch');
  }

  return null;
};
