import * as core from '@actions/core';
import { getInputs } from './config/inputs';
import { normalizeUsages } from './analysis/normalizer';
import { scanWorkflows } from './scanner/workflowScanner';
import { DefaultScorer, computeOverallScore } from './scoring/scorer';
import { defaultWeights } from './scoring/defaultWeights';
import { buildReport } from './report/markdownReport';
import { publishIssue } from './report/issuePublisher';
import { StubTransitiveAnalyzer } from './transitive/stubAnalyzer';
import { logger } from './util/logger';
import { ActionScore } from './scoring/types';

function summarizeCounts(actions: ActionScore[]): {
  shaPinned: number;
  shaShort: number;
  tags: number;
  branches: number;
  locals: number;
  dockerDigest: number;
  dockerTag: number;
  missing: number;
} {
  const counts = {
    shaPinned: 0,
    shaShort: 0,
    tags: 0,
    branches: 0,
    locals: 0,
    dockerDigest: 0,
    dockerTag: 0,
    missing: 0
  };

  actions.forEach((action) => {
    const occ = action.occurrences;
    switch (action.ref.refType) {
      case 'sha-full':
        counts.shaPinned += occ;
        break;
      case 'sha-short':
        counts.shaShort += occ;
        break;
      case 'tag-semver':
      case 'tag-major':
      case 'tag-minor':
        counts.tags += occ;
        break;
      case 'branch':
        counts.branches += occ;
        break;
      case 'local':
        counts.locals += occ;
        break;
      case 'docker-digest':
        counts.dockerDigest += occ;
        break;
      case 'docker-tag':
        counts.dockerTag += occ;
        break;
      default:
        counts.missing += occ;
        break;
    }
  });

  return counts;
}

async function run(): Promise<void> {
  try {
    const inputs = getInputs();
    const scanResult = await scanWorkflows(inputs.paths, inputs.verbose);

    if (inputs.verbose) {
      logger.info(
        `Found ${scanResult.uses.length} uses entries across ${scanResult.workflows.length} workflow(s).`
      );
    }

    const normalizedUsages = normalizeUsages(scanResult.uses);
    const scorer = new DefaultScorer(defaultWeights);
    const transitiveAnalyzer = new StubTransitiveAnalyzer();

    const actionScores = normalizedUsages.map((item) => {
      const transitiveRisk = transitiveAnalyzer.assess(item.ref);
      const scoreResult = scorer.scoreAction({
        ref: item.ref,
        occurrences: item.locations.length,
        transitiveRisk
      });
      return {
        ...scoreResult,
        ref: item.ref,
        occurrences: item.locations.length,
        transitiveRisk,
        locations: item.locations
      };
    });

    const overallScore = computeOverallScore(actionScores);
    const counts = summarizeCounts(actionScores);

    const report = buildReport({
      overallScore,
      workflowsScanned: scanResult.workflows.length,
      totalUses: scanResult.uses.length,
      uniqueActions: actionScores.length,
      parseErrors: scanResult.errors,
      counts,
      actions: actionScores
    });

    const title = `${inputs.issueTitlePrefix} (Score: ${overallScore})`;
    const issueNumber = await publishIssue({
      token: inputs.token,
      title,
      body: report,
      label: inputs.issueLabel,
      mode: inputs.issueMode
    });

    core.setOutput('overall-score', overallScore);
    core.setOutput('issue-number', issueNumber);
    core.setOutput('actions-scanned', actionScores.length);
    core.setOutput('workflows-scanned', scanResult.workflows.length);

    if (inputs.failUnder !== undefined && overallScore < inputs.failUnder) {
      core.setFailed(
        `Overall score ${overallScore} is below fail-under threshold ${inputs.failUnder}. See issue #${issueNumber}.`
      );
    }

    if (scanResult.errors.length > 0) {
      logger.warn('Some workflows could not be parsed; see report for details.');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('Unknown error occurred');
    }
  }
}

run();
