import fg from 'fast-glob';
import { LineCounter, parseAllDocuments } from 'yaml';
import { readFileSafe } from '../util/fs';
import { logger } from '../util/logger';
import { extractUsesFromDocument } from './usesExtractor';
import { RawActionUsage, WorkflowParseError, WorkflowScanResult } from './types';

function buildPatterns(paths: string[]): string[] {
  const patterns: string[] = [];
  paths.forEach((p) => {
    const trimmed = p.trim().replace(/\/+$/, '');
    if (trimmed.endsWith('.yml') || trimmed.endsWith('.yaml')) {
      patterns.push(trimmed);
    } else {
      patterns.push(`${trimmed}/**/*.yml`, `${trimmed}/**/*.yaml`);
    }
  });
  return patterns;
}

export async function scanWorkflows(paths: string[], verbose = false): Promise<WorkflowScanResult> {
  const patterns = buildPatterns(paths);
  const files = await fg(patterns, { dot: true, onlyFiles: true, unique: true });
  const uses: RawActionUsage[] = [];
  const errors: WorkflowParseError[] = [];

  if (verbose) {
    logger.info(`Scanning workflow files: ${files.length} file(s) matched.`);
  }

  for (const file of files) {
    try {
      const content = await readFileSafe(file);
      const lineCounter = new LineCounter();
      const docs = parseAllDocuments(content, { prettyErrors: true, lineCounter });

      for (const doc of docs) {
        if (doc.errors && doc.errors.length > 0) {
          errors.push({ file, message: doc.errors.map((e) => e.message).join('; ') });
          continue;
        }

        try {
          const docContent = doc.toJS({ maxAliasCount: 50 });
          const docUses = extractUsesFromDocument(docContent, file);
          uses.push(...docUses);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          errors.push({ file, message });
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ file, message });
    }
  }

  return {
    workflows: files,
    uses,
    errors
  };
}
