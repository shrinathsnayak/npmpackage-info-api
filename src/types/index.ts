export interface GitHubTypes {
  url: string;
  name: string;
  updatedAt: string;
  forkCount: number;
  description: string;
  stargazerCount: number;
  homepageUrl: string;
  allIssues: {
    totalCount: number;
  };
  closedIssues: {
    totalCount: number;
  };
  openIssues: {
    totalCount: number;
  };
  allPRs: {
    totalCount: number;
  };
  openPRs: {
    totalCount: number;
  };
  mergedPRs: {
    totalCount: number;
  };
  closedPRs: {
    totalCount: number;
  };
  watchers: {
    totalCount: number;
  };
  primaryLanguage: {
    name: string;
  };
  languages: {
    totalSize: number;
    edges: {
      size: number;
      node: {
        name: string;
        color: string;
      };
    }[];
  };
  mentionableUsers: {
    totalCount: number;
  };
  licenseInfo: {
    spdxId: string;
  };
  latestRelease: {
    tagName: string;
  };
  owner: {
    avatarUrl: string;
  };
  issues: {
    totalCount: number;
  };
  pullRequests: {
    totalCount: number;
  };
  refs: {
    nodes: {
      repository: {
        releases: {
          totalCount: number;
          nodes: {
            name: string;
            createdAt: string;
            url: string;
          }[];
        };
      };
    }[];
  };
}

export interface GitHubMappingType {
  status?: number;
  data: {
    url?: string;
    avatar?: string;
    name?: string;
    description?: string;
    license?: string;
    stars?: number;
    issues?: number;
    prs?: number;
    version?: string | undefined;
    readMe?: string;
    homepageUrl?: string | null;
    forks?: number | undefined | null;
  };
}
