import { GitHubMappingType, GitHubTypes } from '@/types';

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
      name: githubData?.name,
      avatar: githubData?.owner?.avatarUrl,
      description: githubData?.description,
      license: githubData?.licenseInfo?.spdxId,
      stars: githubData?.stargazerCount,
      issues: githubData?.issues?.totalCount,
      prs: githubData?.pullRequests?.totalCount,
      version:
        githubData.latestRelease?.tagName?.replace(/^v/, '') ?? undefined,
      readMe: githubData?.readMe?.text
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
      updatedAt
      forkCount
      description
      stargazerCount
      homepageUrl
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
      watchers {
        totalCount
      }
      primaryLanguage {
        name
      }
      languages(first: 100) {
        totalSize
        edges {
          size
          node {
            name
            color
          }
        }
      }
      readMe: object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
      refs(refPrefix: "refs/tags/", last: 1) {
        nodes {
          repository {
            releases(last: 1, orderBy: { field: CREATED_AT, direction: ASC }) {
              totalCount
              nodes {
                name
                createdAt
                url
              }
            }
          }
        }
      }
    }
  }
  `.replace(/\s+/g, ' ');
};
