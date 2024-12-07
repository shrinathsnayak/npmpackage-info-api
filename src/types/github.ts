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

export type LanguageWithPercentage = {
  name: string | undefined;
  color: string | undefined;
  size: number | undefined;
  sizePercentage: string | 0 | undefined;
};

export type GitHubTypes = {
  url?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  diskUsage?: number;
  forkCount?: number;
  repository?: any;
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
  releases?: any;
};

export interface GitHubMappingType {
  status?: number;
  data: {
    owner?: string;
    avatar?: string;
    stars?: number;
    name?: string;
    repositoryUrl?: string | undefined;
    license?: string | undefined;
    latestRelease?: string | undefined;
    homepageUrl?: string | null;
    description?: string | null;
    primaryLanguage?: string | undefined;
    isPrivate: boolean | undefined;
    isInOrganization?: boolean | undefined;
    hasSponsorshipsEnabled?: boolean | undefined;
    defaultBranch?: string | null;
    commits?: number | null;
    forks?: number | undefined | null;
    branches?: number | undefined;
    watchers?: number | undefined;
    unpacked?: number | null;
    createdAt?: number | Date | null;
    updatedAt?: number | Date | null;
    contributorsCount?: number | undefined;
    contributors?: any;
    languages?: LanguageWithPercentage;
    issues?: {
      total?: number;
      open?: number;
      closed?: number;
    };
    prs?: {
      total?: number;
      open?: number;
      closed?: number;
      merged?: number;
    };
    releases?: any;
    readMe?: string | null;
  };
}
