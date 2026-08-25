export interface UploadedFile {
  id: string;
  name: string;
  content: string;
}

export interface ImpactLine {
  lineNumber: number;
  reason: string;
}

export interface FileImpact {
  fileId: string;
  impacts: ImpactLine[];
}

export interface NewFileRecommendation {
  suggestedName: string;
  reason: string;
}

export interface EngineResult {
  overallSummary: string;
  explanation?: string;
  fileImpacts: FileImpact[];
  newFiles?: NewFileRecommendation[];
}
