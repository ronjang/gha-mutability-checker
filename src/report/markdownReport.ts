import { ActionWithLocations, NormalizedActionRef } from '../analysis/types';
import { WorkflowParseError } from '../scanner/types';
import { ActionScore } from '../scoring/types';
import { TransitiveRisk } from '../transitive/types';

export interface ReportActionEntry extends ActionScore {
  locations: ActionWithLocations['locations'];
}

export interface SummaryCounts {
  shaPinned: number;
  shaShort: number;
  tags: number;
  branches: number;
  locals: number;
  dockerDigest: number;
  dockerTag: number;
  missing: number;
}

export interface ReportData {
  overallScore: number;
  workflowsScanned: number;
  totalUses: number;
  uniqueActions: number;
  parseErrors: WorkflowParseError[];
  counts: SummaryCounts;
  actions: ReportActionEntry[];
}

function formatRef(ref: NormalizedActionRef): string {
  return ref.normalized;
}

function formatTransitive(risk: TransitiveRisk): string {
  return `${risk.status}${risk.note ? ` - ${risk.note}` : ''}`;
}

function formatLocations(entry: ReportActionEntry): string[] {
  return entry.locations.map((loc) => {
    const stepInfo =
      loc.type === 'step'
        ? `step ${loc.stepName ?? loc.stepIndex ?? ''}`
        : 'reusable workflow call';
    return `  - ${loc.file} (job: ${loc.jobId ?? 'unknown'}, ${stepInfo})`;
  });
}

function summaryCountsSection(counts: SummaryCounts): string {
  return [
    `- SHA pinned: ${counts.shaPinned}`,
    `- Short SHA: ${counts.shaShort}`,
    `- Tags (semver/major/minor): ${counts.tags}`,
    `- Branch refs: ${counts.branches}`,
    `- Docker digests: ${counts.dockerDigest}`,
    `- Docker tags: ${counts.dockerTag}`,
    `- Local actions: ${counts.locals}`,
    `- Missing/invalid refs: ${counts.missing}`
  ].join('\n');
}

export function buildReport(data: ReportData): string {
  const lines: string[] = [];
  lines.push(`# Action Mutability Report`);
  lines.push('');
  lines.push(`**Overall Score:** ${data.overallScore}`);
  lines.push('');
  lines.push('## Summary');
  lines.push(`- Workflows scanned: ${data.workflowsScanned}`);
  lines.push(`- Total uses: ${data.totalUses}`);
  lines.push(`- Unique actions: ${data.uniqueActions}`);
  lines.push(`- Parse errors: ${data.parseErrors.length}`);
  lines.push('');
  lines.push('### Reference Types');
  lines.push(summaryCountsSection(data.counts));
  lines.push('');
  if (data.parseErrors.length > 0) {
    lines.push('### Parse Errors');
    data.parseErrors.forEach((err) => {
      lines.push(`- ${err.file}: ${err.message}`);
    });
    lines.push('');
  }

  const sortedActions = [...data.actions].sort((a, b) => a.score - b.score);
  lines.push('## Prioritized Actions');
  lines.push('| Action | Score | Ref Type | Occurrences | Top reasons |');
  lines.push('| --- | --- | --- | --- | --- |');
  sortedActions.forEach((action) => {
    lines.push(
      `| ${formatRef(action.ref)} | ${action.score} (${action.grade ?? '-'}) | ${action.ref.refType} | ${action.occurrences} | ${action.reasons.join('<br>')} |`
    );
  });
  lines.push('');

  lines.push('## Detailed Findings');
  sortedActions.forEach((action) => {
    lines.push(`### ${formatRef(action.ref)}`);
    lines.push(`- Score: ${action.score} (${action.grade ?? 'N/A'})`);
    lines.push(`- Kind: ${action.ref.kind}`);
    lines.push(`- Classification: ${action.ref.refType}`);
    lines.push(`- Occurrences: ${action.occurrences}`);
    lines.push(`- Transitive risk: ${formatTransitive(action.transitiveRisk)}`);
    lines.push('- Locations:');
    lines.push(...formatLocations(action));
    lines.push('- Top contributors:');
    action.reasons.forEach((reason) => lines.push(`  - ${reason}`));
    lines.push('- Recommendations:');
    action.recommendations.forEach((rec) => lines.push(`  - ${rec}`));
    lines.push('');
  });

  lines.push('## Transitive dependencies');
  lines.push(
    'Action internals may call additional actions, download scripts/binaries, or use containers without digests. This starter version reports transitive risk as "unknown"; deeper analysis can be added to inspect referenced repositories and images.'
  );
  lines.push('');

  lines.push('## How to interpret the score');
  lines.push(
    'Higher scores indicate stronger pinning (e.g., commit SHAs, digests). Lower scores highlight mutable refs like branches or floating tags. Use the prioritized list to pin the riskiest references first. Scores may change as the heuristic evolves.'
  );

  return lines.join('\n');
}
