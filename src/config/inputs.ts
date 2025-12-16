import * as core from '@actions/core';

export type IssueMode = 'create' | 'update';

export interface Inputs {
  token: string;
  paths: string[];
  issueTitlePrefix: string;
  issueLabel: string;
  issueMode: IssueMode;
  failUnder?: number;
  verbose: boolean;
}

function parseBoolean(input: string): boolean {
  return input.toLowerCase() === 'true';
}

export function getInputs(): Inputs {
  const token = core.getInput('github-token', { required: true });
  const pathsInput = core.getInput('paths') || '.github/workflows';
  const issueTitlePrefix = core.getInput('issue-title-prefix') || 'Action Mutability Report';
  const issueLabel = core.getInput('issue-label') || 'mutability-report';
  const issueMode = (core.getInput('issue-mode') || 'create') as IssueMode;
  const failUnderInput = core.getInput('fail-under');
  const verbose = parseBoolean(core.getInput('verbose') || 'false');

  const paths = pathsInput
    .split(',')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const failUnder = failUnderInput ? Number(failUnderInput) : undefined;
  if (failUnderInput && Number.isNaN(failUnder)) {
    throw new Error('fail-under must be a number');
  }

  return {
    token,
    paths,
    issueTitlePrefix,
    issueLabel,
    issueMode,
    failUnder,
    verbose
  };
}
