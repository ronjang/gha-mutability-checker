import { promises as fs } from 'fs';

export async function readFileSafe(path: string): Promise<string> {
  return fs.readFile(path, 'utf8');
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}
