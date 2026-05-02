export interface Target {
  id: string;
  rank: number;
  name: string;
  category: string;
  mediaTag: string;
  panelReach: number;
  genPopReach: number;
  demReach: number;
  repReach: number;
  insight: string;
}

export interface SearchFilters {
  campaignBrief: string;
  sectors: string[];
  accountTypes: string[];
  targetAudience: '' | 'bpi' | 'public' | 'dem' | 'rep';
}

export interface InsightSummary {
  totalTargets: number;
  avgPanelReach: number;
  avgGenPopReach: number;
  avgDemReach: number;
  avgRepReach: number;
  topMediaTags: string[];
  topCategories: string[];
  narrative: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  timestamp: number;
  filters: SearchFilters;
  results: Target[];
  summary: InsightSummary;
  chatHistory: ChatMessage[];
}

export type AppState = 'empty' | 'loading' | 'results';
