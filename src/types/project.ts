export interface Project {
  day: number;
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: 'Finance' | 'Gamification' | 'Media CLI' | 'Creative Lab' | 'Arcade & Portfolio';
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  score: number; // High-score representation
  rank: string;  // e.g. "01", "02"
  status: 'Production' | 'Active' | 'Complete';
  releaseDate: string;
  features: string[];
}
