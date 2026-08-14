export interface RecommendedResource {
  name: string;
  type: "YouTube" | "Course" | "Documentation" | "Book" | "Interactive" | "Article";
  url: string;
  estimatedTime: string;
  whyRecommended: string;
}

export interface ProjectIdea {
  title: string;
  description: string;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  objective: string;
  topics: string[];
  resources: RecommendedResource[];
  projectIdea: ProjectIdea;
}

export interface RoadmapFormData {
  currentRole: string;
  currentTechStack: string[];
  yearsOfExp: number;
  targetTechStack: string[];
  targetRole?: string;
  additionalInfo?: string;
}

export interface GeneratedRoadmapResponse {
  id: string;
  currentRole: string;
  yearsOfExp: number;
  targetRole?: string;
  targetTechStack: string[];
  phases: RoadmapPhase[];
  createdAt: string;
}
