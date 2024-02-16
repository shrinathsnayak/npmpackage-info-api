import { GitHubMappingType, GitHubTypes } from '@/types/github';

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
  githubData: GitHubTypes
): GitHubMappingType | undefined => {
  if (githubData && Object.keys(githubData).length > 0) {
    return {
      status: 200,
      data: {
        homepageUrl:
          githubData?.url !== githubData?.homepageUrl
            ? githubData?.homepageUrl
            : null,
        avatar: githubData?.owner?.avatarUrl,
        stars: githubData?.stargazerCount,
        issues: githubData?.issues?.totalCount,
        forks: githubData?.forkCount,
        prs: githubData?.pullRequests?.totalCount,
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
      refs(refPrefix: "refs/tags/", last: 1) {
        nodes {
          repository {
            releases(first: 10, orderBy: { field: CREATED_AT, direction: DESC }) {
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
