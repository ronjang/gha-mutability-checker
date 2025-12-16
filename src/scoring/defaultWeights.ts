export interface PenaltyWeights {
  branch: number;
  tagMajor: number;
  tagMinor: number;
  tagSemver: number;
  shaShort: number;
  shaFull: number;
  dockerTag: number;
  dockerDigest: number;
  missing: number;
  local: number;
}

export interface TransitiveWeights {
  sha: number;
  nonSha: number;
}

export interface ScoringWeights {
  penalties: PenaltyWeights;
  transitive: TransitiveWeights;
}

export const defaultWeights: ScoringWeights = {
  penalties: {
    branch: 60,
    tagMajor: 45,
    tagMinor: 35,
    tagSemver: 25,
    shaShort: 10,
    shaFull: 0,
    dockerTag: 40,
    dockerDigest: 0,
    missing: 70,
    local: 10
  },
  transitive: {
    sha: 5,
    nonSha: 10
  }
};
