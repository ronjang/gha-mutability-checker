import { UsesLocation } from '../scanner/types';

export type ActionKind = 'github-action' | 'reusable-workflow' | 'local-action' | 'docker-action';

export type RefType =
  | 'sha-full'
  | 'sha-short'
  | 'tag-semver'
  | 'tag-major'
  | 'tag-minor'
  | 'branch'
  | 'none'
  | 'invalid'
  | 'docker-digest'
  | 'docker-tag'
  | 'local';

export interface NormalizedActionRef {
  kind: ActionKind;
  owner?: string;
  repo?: string;
  path?: string;
  ref?: string;
  refType: RefType;
  raw: string;
  normalized: string;
}

export interface ActionWithLocations {
  ref: NormalizedActionRef;
  locations: UsesLocation[];
}
