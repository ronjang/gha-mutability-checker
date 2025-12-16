import { NormalizedActionRef } from '../analysis/types';
import { defaultWeights, ScoringWeights } from './defaultWeights';
import { ActionScore, ScoreInput, ScoreResult } from './types';

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function computeGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'E';
}

function basePenalty(
  ref: NormalizedActionRef,
  weights: ScoringWeights
): { penalty: number; reason?: string; recommendation?: string } {
  switch (ref.refType) {
    case 'branch':
      return {
        penalty: weights.penalties.branch,
        reason: 'Branch reference is mutable and can drift.',
        recommendation: 'Pin this action to a commit SHA.'
      };
    case 'tag-major':
      return {
        penalty: weights.penalties.tagMajor,
        reason: 'Major tag is mutable; new minors/patches can change behavior.',
        recommendation: 'Pin to a full SHA or vetted tag.'
      };
    case 'tag-minor':
      return {
        penalty: weights.penalties.tagMinor,
        reason: 'Minor tag is mutable and can change on patch releases.',
        recommendation: 'Pin to a full SHA for reproducibility.'
      };
    case 'tag-semver':
      return {
        penalty: weights.penalties.tagSemver,
        reason: 'Semver tag is mutable until replaced with a SHA.',
        recommendation: 'Prefer pinning to a full commit SHA.'
      };
    case 'sha-short':
      return {
        penalty: weights.penalties.shaShort,
        reason: 'Short SHA is less explicit; collisions or rewrites are possible.',
        recommendation: 'Use a full 40-character SHA.'
      };
    case 'sha-full':
      return {
        penalty: weights.penalties.shaFull,
        reason: 'Full SHA is immutable.',
        recommendation: undefined
      };
    case 'docker-tag':
      return {
        penalty: weights.penalties.dockerTag,
        reason: 'Docker tag is mutable; images can change without digest pinning.',
        recommendation: 'Use a docker digest (docker://image@sha256:...).'
      };
    case 'docker-digest':
      return {
        penalty: weights.penalties.dockerDigest,
        reason: 'Docker digest is immutable.',
        recommendation: undefined
      };
    case 'none':
    case 'invalid':
      return {
        penalty: weights.penalties.missing,
        reason: 'Missing or invalid ref defaults to latest, which is mutable.',
        recommendation: 'Add an explicit commit SHA or versioned ref.'
      };
    case 'local':
      return {
        penalty: weights.penalties.local,
        reason: 'Local action relies on repository state; ensure dependencies are pinned.',
        recommendation: 'Keep local action dependencies locked and reviewed.'
      };
    default:
      return { penalty: 0, reason: 'Unknown ref type.', recommendation: undefined };
  }
}

export class DefaultScorer {
  constructor(private weights: ScoringWeights = defaultWeights) {}

  scoreAction(input: ScoreInput): ScoreResult {
    const { ref, transitiveRisk } = input;
    let score = 100;
    const reasons: string[] = [];
    const recommendations: string[] = [];

    const { penalty, reason, recommendation } = basePenalty(ref, this.weights);
    score -= penalty;
    if (reason) reasons.push(reason);
    if (recommendation) recommendations.push(recommendation);

    // Transitive risk modifier
    if (
      ref.refType === 'sha-full' ||
      ref.refType === 'sha-short' ||
      ref.refType === 'docker-digest'
    ) {
      score -= this.weights.transitive.sha;
      reasons.push('Transitive dependency risk unknown; root is pinned but internals may drift.');
      recommendations.push(
        'Review the action for nested uses, downloads, and container references.'
      );
    } else {
      score -= this.weights.transitive.nonSha;
      reasons.push('Ref is mutable; transitive dependencies compound drift risk.');
      recommendations.push('Pin to SHA to reduce both direct and transitive risk.');
    }

    if (transitiveRisk.note) {
      reasons.push(`Transitive note: ${transitiveRisk.note}`);
    }

    const finalScore = clamp(score);

    return {
      score: finalScore,
      grade: computeGrade(finalScore),
      reasons: reasons.slice(0, 3),
      recommendations: recommendations.slice(0, 3)
    };
  }
}

export function computeOverallScore(actionScores: ActionScore[]): number {
  if (actionScores.length === 0) {
    return 100;
  }
  const totalOccurrences = actionScores.reduce((sum, item) => sum + item.occurrences, 0);
  if (totalOccurrences === 0) {
    return 100;
  }
  const weightedSum = actionScores.reduce((sum, item) => sum + item.score * item.occurrences, 0);
  return Math.round((weightedSum / totalOccurrences) * 100) / 100;
}
