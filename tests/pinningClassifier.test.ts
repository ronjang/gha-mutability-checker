import { classifyDockerRef, classifyRef } from '../src/analysis/pinningClassifier';

describe('classifyRef', () => {
  it('classifies shas and tags', () => {
    expect(classifyRef('1234567890abcdef1234567890abcdef12345678')).toBe('sha-full');
    expect(classifyRef('1234567')).toBe('sha-short');
    expect(classifyRef('v1.2.3')).toBe('tag-semver');
    expect(classifyRef('v1.2')).toBe('tag-minor');
    expect(classifyRef('v1')).toBe('tag-major');
    expect(classifyRef('main')).toBe('branch');
    expect(classifyRef(undefined)).toBe('none');
  });
});

describe('classifyDockerRef', () => {
  it('classifies docker refs', () => {
    expect(classifyDockerRef('sha256:abc')).toBe('docker-digest');
    expect(classifyDockerRef('latest')).toBe('docker-tag');
    expect(classifyDockerRef(undefined)).toBe('docker-tag');
  });
});
