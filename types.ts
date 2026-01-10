export enum Gender {
  MALE = "Nam",
  FEMALE = "Nữ",
  OTHER = "Khác",
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
}

export interface FortuneResult {
  summary: string;
  career: string;
  love: string;
  health: string;
  luckyNumber: number;
  luckyColor: string;
}

export interface LoveCompatibility {
  score: number;
  verdict: string;
  pros: string[];
  cons: string[];
  advice: string;
}

export interface ReadingSubsection {
  title: string;
  content: string;
}

export interface ReadingSection {
  id: string;
  title: string;
  content: string;
  subsections?: ReadingSubsection[];
}

export interface ComprehensiveReading {
  overview: string;
  sections: ReadingSection[];
}

export interface ReadingChunk {
  chunkId: number;
  sectionId: string;
  title: string;
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface ProgressiveReading {
  overview: string;
  overviewComplete: boolean;
  chunks: ReadingChunk[];
  totalChunks: number;
  completedChunks: number;
}

export type ViewState =
  | "HOME"
  | "PROFILE"
  | "FORTUNE"
  | "COMPREHENSIVE"
  | "LOVE_INPUT"
  | "LOVE_RESULT";
