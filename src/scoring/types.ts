import { NormalizedActionRef } from '../analysis/types';
import { TransitiveRisk } from '../transitive/types';

export interface ScoreResult {
  score: number;
  grade?: string;
  reasons: string[];
  recommendations: string[];
}

export interface ScoreInput {
  ref: NormalizedActionRef;
  occurrences: number;
  transitiveRisk: TransitiveRisk;
}

export interface ActionScore extends ScoreResult {
  ref: NormalizedActionRef;
  occurrences: number;
  transitiveRisk: TransitiveRisk;
}
