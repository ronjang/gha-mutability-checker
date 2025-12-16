import { DefaultScorer } from '../src/scoring/scorer';
import { defaultWeights } from '../src/scoring/defaultWeights';
import { NormalizedActionRef } from '../src/analysis/types';

describe('DefaultScorer', () => {
  const scorer = new DefaultScorer(defaultWeights);

  it('penalizes branch refs heavily', () => {
    const ref: NormalizedActionRef = {
      kind: 'github-action',
      owner: 'actions',
      repo: 'checkout',
      path: undefined,
      ref: 'main',
      refType: 'branch',
      raw: 'actions/checkout@main',
      normalized: 'actions/checkout@main'
    };

    const result = scorer.scoreAction({
      ref,
      occurrences: 1,
      transitiveRisk: { status: 'unknown' }
    });
    expect(result.score).toBe(30); // 100 - 60 branch - 10 transitive non-sha
  });

  it('keeps SHA-pinned refs high', () => {
    const ref: NormalizedActionRef = {
      kind: 'github-action',
      owner: 'actions',
      repo: 'checkout',
      path: undefined,
      ref: '1234567890abcdef1234567890abcdef12345678',
      refType: 'sha-full',
      raw: 'actions/checkout@1234567890abcdef1234567890abcdef12345678',
      normalized: 'actions/checkout@1234567890abcdef1234567890abcdef12345678'
    };

    const result = scorer.scoreAction({
      ref,
      occurrences: 1,
      transitiveRisk: { status: 'unknown' }
    });
    expect(result.score).toBe(95); // 100 - 0 - 5 transitive sha
  });
});
