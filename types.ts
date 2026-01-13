export interface ResumeSection {
  title: string;
  content: string[];
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  dates: string;
  location?: string;
  description: string[]; // Bullet points
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  dates: string;
}

export interface ResumeData {
  fullName: string;
  contactInfo: {
    email: string;
    phone: string;
    linkedin?: string;
    location?: string;
  };
  summary: string;
  skills: string[];
  experience: WorkExperience[];
  education: Education[];
  rawText?: string;
}

export interface ScoreCategory {
  name: string;
  score: number; // 0-100
  feedback: string;
  status: 'good' | 'warning' | 'critical';
}

export interface AnalysisResult {
  overallScore: number;
  categories: ScoreCategory[];
  keywordGaps: string[];
  formattingIssues: string[];
  topStrengths: string[];
  tailoringSuggestions: string[];
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  DASHBOARD = 'DASHBOARD',
}
