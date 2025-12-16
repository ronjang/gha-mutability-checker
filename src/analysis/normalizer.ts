import { RawActionUsage } from '../scanner/types';
import { classifyDockerRef, classifyRef } from './pinningClassifier';
import { ActionKind, ActionWithLocations, NormalizedActionRef } from './types';

function normalizeGitHubReference(raw: string): NormalizedActionRef {
  const trimmed = raw.trim();
  const [actionPath, ref] = trimmed.split('@');
  const segments = actionPath.split('/');

  if (segments.length < 2 || !segments[0] || !segments[1]) {
    return {
      kind: 'github-action',
      raw: trimmed,
      ref,
      refType: 'invalid',
      normalized: trimmed
    };
  }

  const [owner, repo, ...rest] = segments;
  const path = rest.length > 0 ? rest.join('/') : undefined;
  const refType = classifyRef(ref);
  const kind: ActionKind =
    path && path.includes('.github/workflows') ? 'reusable-workflow' : 'github-action';
  const normalized = `${owner}/${repo}${path ? `/${path}` : ''}@${ref ?? '<none>'}`;

  return {
    kind,
    owner,
    repo,
    path,
    ref,
    refType,
    raw: trimmed,
    normalized
  };
}

function normalizeDockerReference(raw: string): NormalizedActionRef {
  const trimmed = raw.trim();
  const withoutScheme = trimmed.replace(/^docker:\/\//, '');
  let image = withoutScheme;
  let ref: string | undefined;

  if (withoutScheme.includes('@')) {
    const [img, refPart] = withoutScheme.split('@');
    image = img;
    ref = refPart;
  } else if (withoutScheme.includes(':')) {
    const lastColon = withoutScheme.lastIndexOf(':');
    image = withoutScheme.substring(0, lastColon);
    ref = withoutScheme.substring(lastColon + 1);
  }

  const refType = classifyDockerRef(ref);
  const normalized = ref ? `docker://${image}@${ref}` : `docker://${image}`;

  return {
    kind: 'docker-action',
    path: image,
    ref,
    refType,
    raw: trimmed,
    normalized
  };
}

function normalizeLocalReference(raw: string): NormalizedActionRef {
  const trimmed = raw.trim();
  return {
    kind: 'local-action',
    path: trimmed,
    refType: 'local',
    raw: trimmed,
    normalized: trimmed
  };
}

export function normalizeReference(raw: string): NormalizedActionRef {
  if (raw.startsWith('docker://')) {
    return normalizeDockerReference(raw);
  }
  if (raw.startsWith('.')) {
    return normalizeLocalReference(raw);
  }
  return normalizeGitHubReference(raw);
}

function buildKey(ref: NormalizedActionRef): string {
  return `${ref.kind}:${ref.normalized}`;
}

export function normalizeUsages(rawUses: RawActionUsage[]): ActionWithLocations[] {
  const grouped = new Map<string, ActionWithLocations>();

  rawUses.forEach((usage) => {
    const ref = normalizeReference(usage.uses);
    const key = buildKey(ref);
    const existing = grouped.get(key);
    if (existing) {
      existing.locations.push(usage.location);
    } else {
      grouped.set(key, { ref, locations: [usage.location] });
    }
  });

  return Array.from(grouped.values());
}
