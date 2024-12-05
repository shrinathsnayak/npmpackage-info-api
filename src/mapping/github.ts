import { GitHubMappingType, GitHubTypes } from '@/types/github';
import { generateLanguageArray, generateReleases } from '@/utils/helpers';

/**
 * The function `mapGithubData` takes in GitHub data and maps it to a specific format, returning
 * undefined if the input is empty.
 * @param {GitHubTypes} githubData - The `githubData` parameter is an object of type `GitHubTypes`. It
 * contains data related to a GitHub repository, such as the repository name, owner information,
 * description, license, number of stars, number of issues, number of pull requests, latest release
 * version, and the content of the README
 * @returns The function `mapGithubData` returns a `GitHubMappingType` object or `undefined`.
 */
export const mapGithubData = (
  githubData: GitHubTypes,
  owner: string,
  contributors: any[]
): GitHubMappingType | undefined => {
  if (githubData && Object.keys(githubData).length > 0) {
    return {
      status: 200,
      data: {
        owner: owner,
        name: githubData?.name,
        homepageUrl:
          githubData?.url !== githubData?.homepageUrl
            ? githubData?.homepageUrl
            : null,
        repositoryUrl: githubData?.url,
        avatar: githubData?.owner?.avatarUrl,
        description: githubData?.description,
        createdAt: githubData?.createdAt,
        updatedAt: githubData?.updatedAt,
        license: githubData?.licenseInfo?.spdxId,
        latestRelease: githubData?.latestRelease?.tagName,
        primaryLanguage: githubData?.primaryLanguage?.name,
        isPrivate: githubData?.isPrivate,
        isInOrganization: githubData?.isInOrganization,
        hasSponsorshipsEnabled: githubData?.hasSponsorshipsEnabled,
        defaultBranch: githubData?.defaultBranchRef?.name,
        commits: githubData?.defaultBranchRef?.target?.history?.totalCount,
        stars: githubData?.stargazerCount,
        forks: githubData?.forkCount,
        branches: githubData?.branches?.totalCount,
        watchers: githubData?.watchers?.totalCount,
        unpacked: githubData?.diskUsage,
        contributorsCount: githubData?.mentionableUsers?.totalCount,
        prs: {
          total: githubData?.allPRs?.totalCount,
          open: githubData?.openPRs?.totalCount,
          closed: githubData?.closedPRs?.totalCount,
          merged: githubData?.mergedPRs?.totalCount
        },
        issues: {
          total: githubData?.allIssues?.totalCount,
          open: githubData?.openIssues?.totalCount,
          closed: githubData?.closedIssues?.totalCount
        },
        languages: generateLanguageArray(githubData?.languages),
        contributors: contributors,
        releases: generateReleases(githubData?.releases?.nodes?.[0])
      }
    };
  }

  return undefined;
};

/**
 * The `graphQuery` function returns a GraphQL query string that retrieves various information about a
 * repository, given the owner and repo name.
 * @param {string} owner - The `owner` parameter represents the username or organization name of the
 * repository owner on GitHub.
 * @param {string} repo - The `repo` parameter is the name of the repository you want to query. It
 * represents the name of the repository you want to get information about.
 * @returns The function `graphQuery` returns a GraphQL query string.
 */
export const graphQuery = (owner: string, repo: string) => {
  return `query {
    repository(owner: "${owner}", name: "${repo}") {
      url
      name
      createdAt
      updatedAt
      diskUsage
      forkCount
      isInOrganization
      hasSponsorshipsEnabled
      defaultBranchRef {
        name
        target {
          ... on Commit {
            history {
              totalCount
            }
          }
        }
      }
      description
      stargazerCount
      homepageUrl
      isPrivate
      allIssues: issues {
        totalCount
      }
      closedIssues: issues(states: CLOSED) {
        totalCount
      }
      openIssues: issues(states: OPEN) {
        totalCount
      }
      allPRs: pullRequests {
        totalCount
      }
      openPRs: pullRequests(states: OPEN) {
        totalCount
      }
      mergedPRs: pullRequests(states: MERGED) {
        totalCount
      }
      closedPRs: pullRequests(states: CLOSED) {
        totalCount
      }
      branches: refs(first: 0, refPrefix: "refs/heads/") {
        totalCount
      }
      watchers {
        totalCount
      }
      primaryLanguage {
        name
      }
      languages(first: 50) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      mentionableUsers {
        totalCount
      }
      licenseInfo {
        spdxId
      }
      latestRelease {
        tagName
      }
      owner {
        avatarUrl
      }
      issues(states: OPEN) {
        totalCount
      }
      pullRequests(states: OPEN) {
        totalCount
      }
      releases: refs(refPrefix: "refs/tags/", last: 1) {
        nodes {
          repository {
            releases(first: 6, orderBy: { field: CREATED_AT, direction: DESC }) {
              totalCount
              nodes {
                name
                createdAt
                url
                publishedAt
                tag {
                  name
                }
              }
            }
          }
        }
      }
    }
  }
  `.replace(/\s+/g, ' ');
};

/**
 * Generates a GraphQL query string to fetch security vulnerabilities for a given NPM package.
 *
 * @param packageName - The name of the NPM package to query for vulnerabilities.
 * @returns A GraphQL query string to fetch security vulnerabilities.
 */
export const graphQueryForVulnerabilities = (packageName: string) => {
  return `query {
    securityVulnerabilities(package: "${packageName}", ecosystem: NPM, first: 50) {
      edges {
        node {
          vulnerableVersionRange
          severity
          firstPatchedVersion {
            identifier
          }
          advisory {
            description
            summary
            publishedAt
            updatedAt
            severity
            cvss {
              score
            }
            permalink
            references {
              url
            }
            identifiers {
              type
              value
            }
          }
        }
      }
    }
  }
  `.replace(/\s+/g, ' ');
};
