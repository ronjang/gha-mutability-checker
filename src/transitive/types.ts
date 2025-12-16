import { NormalizedActionRef } from '../analysis/types';

export type TransitiveRiskStatus = 'unknown' | 'low' | 'medium' | 'high';

export interface TransitiveRisk {
  status: TransitiveRiskStatus;
  note?: string;
}

export interface TransitiveAnalyzer {
  assess(ref: NormalizedActionRef): TransitiveRisk;
}
