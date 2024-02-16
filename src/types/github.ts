// Github Type Definitions

export type AllIssues = {
  totalCount?: number;
};

export type DefaultBranchRef = {
  name?: string;
  target?: Target;
};

export type Target = {
  history?: AllIssues;
};

export type Languages = {
  totalSize?: number;
  edges?: Edge[];
};

export type Edge = {
  size?: number;
  node?: EdgeNode;
};

export type EdgeNode = {
  name?: string;
  color?: string;
};

export type LatestRelease = {
  tagName?: string;
};

export type LicenseInfo = {
  spdxId?: string;
};

export type Owner = {
  avatarUrl?: string;
};

export type PrimaryLanguage = {
  name?: string;
};

export type Refs = {
  nodes?: RefsNode[];
};

export type RefsNode = {
  repository?: Repository;
};

export type Repository = {
  releases?: Releases;
};

export type Releases = {
  totalCount?: number;
  nodes?: ReleasesNode[];
};

export type ReleasesNode = {
  name?: string;
  createdAt?: Date;
  url?: string;
  publishedAt?: Date;
  tag?: PrimaryLanguage;
};

export type GitHubTypes = {
  url?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  diskUsage?: number;
  forkCount?: number;
  isInOrganization?: boolean;
  hasSponsorshipsEnabled?: boolean;
  defaultBranchRef?: DefaultBranchRef;
  description?: string;
  stargazerCount?: number;
  homepageUrl?: string;
  isPrivate?: boolean;
  allIssues?: AllIssues;
  closedIssues?: AllIssues;
  openIssues?: AllIssues;
  allPRs?: AllIssues;
  openPRs?: AllIssues;
  mergedPRs?: AllIssues;
  closedPRs?: AllIssues;
  branches?: AllIssues;
  watchers?: AllIssues;
  primaryLanguage?: PrimaryLanguage;
  languages?: Languages;
  mentionableUsers?: AllIssues;
  licenseInfo?: LicenseInfo;
  latestRelease?: LatestRelease;
  owner?: Owner;
  issues?: AllIssues;
  pullRequests?: AllIssues;
  refs?: Refs;
};

export interface GitHubMappingType {
  status?: number;
  data: {
    avatar?: string;
    stars?: number;
    issues?: number;
    prs?: number;
    homepageUrl?: string | null;
    forks?: number | undefined | null;
  };
}
