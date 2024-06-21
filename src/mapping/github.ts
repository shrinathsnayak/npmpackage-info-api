import { GitHubMappingType, GitHubTypes } from '@/types/github';
import { generateLanguageArray } from '@/utils/helpers';

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
  readMeData: string | null,
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
        contributors: githubData?.mentionableUsers?.totalCount,
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
        readMe: readMeData
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
      readMe: object(expression: "HEAD:README.md") {
        ... on Blob {
          text
        }
      }
      readMeOther: object(expression: "HEAD:readme.md") {
        ... on Blob {
          text
        }
      }
      otherFile: object(expression: "HEAD:index.js") {
        ... on Blob {
          text
        }
      }
      nextjsReadMe: object(expression: "HEAD:packages/next/README.md") {
        ... on Blob {
          text
        }
      }
      releases: refs(refPrefix: "refs/tags/", last: 1) {
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
