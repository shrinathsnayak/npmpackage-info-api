// NPM Type Definitions

export type NpmTypes = {
  name?: string;
  version?: string;
  description?: string;
  main?: string;
  license?: string;
  repository?: Repository;
  bugs?: Bugs;
  homepage?: string;
  types?: string;
  bin?: Bin;
  scripts?: any;
  dependencies?: any;
  peerDependencies?: any;
  devDependencies?: { [key: string]: string };
  engines?: Engines;
  optionalDependencies?: any;
  gitHead?: string;
  _id?: string;
  _nodeVersion?: string;
  _npmVersion?: string;
  dist?: any;
  _npmUser?: NpmUser;
  directories?: any;
  maintainers?: NpmUser[];
  _hasShrinkwrap?: boolean;
};

type NpmUser = {
  name?: string;
  email?: string;
};

type Bin = {
  next?: string;
};

type Bugs = {
  url?: string;
};

type Engines = {
  node?: string;
};

type Repository = {
  type?: string;
  url?: string;
};

export type NpmMappingType = {
  status?: number;
  data?: {
    name?: string;
    version?: string;
    description?: string;
    license?: string;
    repositoryUrl?: string;
    bugsUrl?: string;
    homepage?: string;
    types?: boolean;
    minNodeVersion?: string;
    package: {
      id?: string;
      nodeVersion?: string;
      npmVersion?: string;
      unpackedSize?: number;
      fileCount?: number;
    };
    collaborators?: MaintainersTypes[] | undefined;
    npmUser?: any;
    dependencies?: {
      dependencies?: {
        totalCount?: number;
        data: Record<string, string>;
      };
      devDependencies?: {
        totalCount?: number;
        data: Record<string, string>;
      };
      peerDependencies?: {
        totalCount?: number;
        data: Record<string, string>;
      };
      optionalDependencies?: {
        totalCount?: number;
        data: Record<string, string>;
      };
    };
  };
};

type MaintainersTypes = {
  name?: string;
  email?: string;
  img?: string;
};
