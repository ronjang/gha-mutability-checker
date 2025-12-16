import { scanWorkflows } from '../src/scanner/workflowScanner';

const fixturePath = 'tests/fixtures/workflow-basic.yml';

describe('workflow scanner', () => {
  it('extracts uses and job-level calls', async () => {
    const result = await scanWorkflows([fixturePath]);
    expect(result.uses.length).toBe(5);
    const jobUses = result.uses.filter((u) => u.location.type === 'job');
    expect(jobUses.length).toBe(1);
    const stepUses = result.uses.filter((u) => u.location.type === 'step');
    expect(stepUses.length).toBe(4);
    expect(result.errors.length).toBe(0);
  });
});
