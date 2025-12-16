import { buildReport } from '../src/report/markdownReport';
import { ReportActionEntry } from '../src/report/markdownReport';

describe('markdown report', () => {
  it('includes key sections and details', () => {
    const actions: ReportActionEntry[] = [
      {
        ref: {
          kind: 'github-action',
          owner: 'actions',
          repo: 'checkout',
          path: undefined,
          ref: 'main',
          refType: 'branch',
          raw: 'actions/checkout@main',
          normalized: 'actions/checkout@main'
        },
        score: 30,
        grade: 'D',
        reasons: ['Branch reference is mutable and can drift.'],
        recommendations: ['Pin this action to a commit SHA.'],
        occurrences: 1,
        transitiveRisk: { status: 'unknown' },
        locations: [
          {
            file: '.github/workflows/test.yml',
            jobId: 'build',
            stepIndex: 0,
            stepName: 'Checkout',
            type: 'step'
          }
        ]
      }
    ];

    const report = buildReport({
      overallScore: 40,
      workflowsScanned: 1,
      totalUses: 1,
      uniqueActions: 1,
      parseErrors: [],
      counts: {
        shaPinned: 0,
        shaShort: 0,
        tags: 0,
        branches: 1,
        locals: 0,
        dockerDigest: 0,
        dockerTag: 0,
        missing: 0
      },
      actions
    });

    expect(report).toContain('Action Mutability Report');
    expect(report).toContain('Overall Score');
    expect(report).toContain('Prioritized Actions');
    expect(report).toContain('Transitive dependencies');
    expect(report).toContain('How to interpret the score');
  });
});
