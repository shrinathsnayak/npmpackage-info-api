export type SecurityScan = {
  date?: Date;
  repo?: Repo;
  scorecard?: Scorecard;
  score?: number;
  checks?: CheckType[];
};

export interface CheckType {
  name?: string;
  score?: number;
  reason?: string;
  details?: string[] | null;
  documentation?: Documentation;
}

export type Documentation = {
  short?: string;
  url?: string;
};

export type Repo = {
  name?: string;
  commit?: string;
};

export type Scorecard = {
  version?: string;
  commit?: string;
};

export type MapDataType = {
  status: number;
  data: {
    lastScanned?: string | Date;
    overallScore?: number;
    score?: number;
    checks?: any;
  };
};
