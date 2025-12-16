import { NormalizedActionRef } from '../analysis/types';
import { TransitiveAnalyzer, TransitiveRisk } from './types';

export class StubTransitiveAnalyzer implements TransitiveAnalyzer {
  assess(ref: NormalizedActionRef): TransitiveRisk {
    void ref;
    return {
      status: 'unknown',
      note: 'Transitive dependency analysis not implemented in this version.'
    };
  }
}
