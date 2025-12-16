import { RawActionUsage } from './types';

export function extractUsesFromDocument(docContent: any, file: string): RawActionUsage[] {
  const results: RawActionUsage[] = [];
  if (!docContent || typeof docContent !== 'object') {
    return results;
  }

  const jobs = (docContent as any).jobs;
  if (!jobs || typeof jobs !== 'object') {
    return results;
  }

  for (const [jobId, jobConfig] of Object.entries<any>(jobs)) {
    if (!jobConfig || typeof jobConfig !== 'object') {
      continue;
    }

    if (jobConfig.uses) {
      results.push({
        uses: String(jobConfig.uses),
        location: { file, jobId, type: 'job' }
      });
    }

    const steps = Array.isArray(jobConfig.steps) ? jobConfig.steps : [];
    steps.forEach((step: any, index: number) => {
      if (!step || typeof step !== 'object') {
        return;
      }
      if (step.uses) {
        results.push({
          uses: String(step.uses),
          location: {
            file,
            jobId,
            stepIndex: index,
            stepName: typeof step.name === 'string' ? step.name : undefined,
            type: 'step'
          }
        });
      }
    });
  }

  return results;
}
