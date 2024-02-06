export interface GitHubTypes {
  html_url: string;
  name: string;
  description: string;
  stargazerCount: number;
  readMe: {
    text: string;
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
  licenseInfo: {
    spdxId: string;
  };
  latestRelease: {
    tagName: any;
  };
}

export interface GitHubMappingType {
  url?: string;
  avatar: string;
  name: string;
  description: string;
  license: string;
  stars: number;
  issues: number;
  prs: number;
  version: string | undefined;
  readMe: string;
}
