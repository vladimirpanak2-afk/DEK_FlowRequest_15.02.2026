
export type Status = 'PENDING' | 'SENT' | 'DONE' | 'BLOCKED' | 'NEEDS_REVIEW';
export type FlowStatus = 'ACTIVE' | 'COMPLETED' | 'READY_TO_PROMISE';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  role_key: string; 
  isAdmin?: boolean; // Pouze admin může měnit pravidla
}

export interface RuleGroup {
  name: string;
  keywords: string[];
}

export interface RoleMapping {
  id: string;
  role: string;
  groups: RuleGroup[];
  contexts?: string[]; // Např. ["NOVOSTAVBA", "REKONSTRUKCE"]
}

export interface SubRequest {
  id: string;
  title: string;
  task_type: string;
  description: string;
  assigneeId: string; // ID uživatele
  assigned_role_key: string; 
  status: Status;
  dueDate: string;
  completedAt?: string;
  replySummary?: string;
  replyVerdict?: 'CONFIRMED' | 'REJECTED' | 'UNCLEAR';
  sentEmailCopy?: string;
  isBroadcast?: boolean; // Příznak hromadného úkolu
}

export interface Flow {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  createdAt: string;
  status: FlowStatus;
  subRequests: SubRequest[];
  tags: string[];
  flowType?: 'COMMERCIAL' | 'MANAGEMENT'; // Rozlišení typu flow
}

export interface AIAnalysisResult {
  title: string;
  suggestedSubTasks: {
    title: string;
    description: string;
    task_type: string;
    estimatedRoleKey: string;
    suggestedDeadline: string;
    targetScope?: 'INDIVIDUAL' | 'ROLE_ALL'; // AI může navrhnout hromadný úkol
  }[];
}

export interface SavedAnalysis {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imagePreview?: string;
  mimeType?: string;
}
