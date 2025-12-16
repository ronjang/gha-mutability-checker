export type LocationType = 'step' | 'job';

export interface UsesLocation {
  file: string;
  jobId?: string;
  stepIndex?: number;
  stepName?: string;
  type: LocationType;
  line?: number;
}

export interface RawActionUsage {
  uses: string;
  location: UsesLocation;
}

export interface WorkflowParseError {
  file: string;
  message: string;
}

export interface WorkflowScanResult {
  workflows: string[];
  uses: RawActionUsage[];
  errors: WorkflowParseError[];
}
