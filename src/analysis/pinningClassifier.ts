import { RefType } from './types';

const FULL_SHA_REGEX = /^[0-9a-f]{40}$/i;
const SHORT_SHA_REGEX = /^[0-9a-f]{7,39}$/i;
const SEMVER_REGEX = /^v?\d+\.\d+\.\d+$/;
const MINOR_REGEX = /^v?\d+\.\d+$/;
const MAJOR_REGEX = /^v?\d+$/;

export function classifyRef(ref?: string): RefType {
  if (!ref) {
    return 'none';
  }
  if (FULL_SHA_REGEX.test(ref)) {
    return 'sha-full';
  }
  if (SHORT_SHA_REGEX.test(ref)) {
    return 'sha-short';
  }
  if (SEMVER_REGEX.test(ref)) {
    return 'tag-semver';
  }
  if (MINOR_REGEX.test(ref)) {
    return 'tag-minor';
  }
  if (MAJOR_REGEX.test(ref)) {
    return 'tag-major';
  }
  return 'branch';
}

export function classifyDockerRef(ref?: string): RefType {
  if (!ref) {
    return 'docker-tag';
  }
  if (ref.startsWith('sha256:')) {
    return 'docker-digest';
  }
  return 'docker-tag';
}
