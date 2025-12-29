/**
 * Auto-Agent Task System - TypeScript Types
 * Type definitions matching Supabase schema
 */

// ============================================
// ENUMS
// ============================================

export enum TaskStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  NEEDS_REFINEMENT = 'needs_refinement',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  BLOCKED = 'blocked',
}

export enum TaskPriority {
  CRITICAL = 'critical',  // P0
  HIGH = 'high',          // P1
  MEDIUM = 'medium',      // P2
  LOW = 'low',            // P3
  BACKLOG = 'backlog',    // P4
}

export enum TaskRecurrence {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom',
}

export enum ExecutionSystem {
  AUTONOMOUS_AGENT = 'autonomous_agent',
  ASSET_GENERATOR = 'asset_generator',
  PROFESSIONAL = 'professional',
  PERSONAL = 'personal',
  PROJECTS = 'projects',
  CUSTOM = 'custom',
}

export enum ExecutionType {
  CLAUDE_SESSION = 'claude_session',  // Execute via Claude Code with prompt
  SCRIPT = 'script',                  // Execute pre-created script
  HYBRID = 'hybrid',                  // Script that calls Claude Code
}

export enum CreatorType {
  HUMAN = 'human',
  AGENT_AUTONOMOUS = 'agent_autonomous',
  AGENT_DAILY = 'agent_daily',
  AGENT_ASSET = 'agent_asset',
  SYSTEM = 'system',
}

export enum CommentType {
  COMMENT = 'comment',
  REFINEMENT = 'refinement',
  APPROVAL = 'approval',
  SYSTEM = 'system',
}

// ============================================
// CORE INTERFACES
// ============================================

export interface Task {
  // Identity
  id: string;

  // Core fields
  title: string;
  description: string;
  prompt?: string | null;

  // System and execution
  system: ExecutionSystem;
  custom_system?: string | null;

  // Execution type and configuration
  execution_type: ExecutionType;
  script_path?: string | null;      // Path to script (for script/hybrid)
  script_args?: Record<string, any> | null;  // Arguments for script
  timeout_seconds: number;           // Execution timeout

  // Status and workflow
  status: TaskStatus;
  priority: TaskPriority;

  // Creator tracking
  created_by: CreatorType;
  created_by_user_id?: string | null;
  created_by_agent?: string | null;

  // Recurrence
  recurrence: TaskRecurrence;
  recurrence_pattern?: string | null;

  // Scheduling
  scheduled_for?: string | null;  // ISO timestamp
  execute_after?: string | null;
  deadline?: string | null;

  // Dependencies
  depends_on?: string[] | null;
  blocks?: string[] | null;

  // Approval and refinement
  approved_by?: string | null;
  approved_at?: string | null;
  refinement_notes?: string | null;

  // Execution tracking
  started_at?: string | null;
  completed_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  execution_log?: string | null;

  // Metadata
  tags?: string[] | null;
  metadata?: Record<string, any> | null;

  // Auto-approval
  auto_approve_pattern?: string | null;
  is_pre_approved: boolean;

  // Recurrence tracking
  parent_task_id?: string | null;
  recurrence_instance_date?: string | null;
  next_recurrence_at?: string | null;

  // Audit
  created_at: string;
  updated_at: string;
}

export interface TaskExecution {
  id: string;
  task_id: string;

  // Execution details
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;

  // Result
  status: TaskStatus;
  exit_code?: number | null;
  error_message?: string | null;

  // Logs and output
  execution_log_path?: string | null;
  output_summary?: string | null;
  output_data?: Record<string, any> | null;

  // Resources
  tokens_used?: number | null;
  cost_usd?: number | null;

  // Metadata
  executed_by?: string | null;
  metadata?: Record<string, any> | null;

  created_at: string;
}

export interface TaskApprovalRule {
  id: string;

  // Rule definition
  name: string;
  description?: string | null;

  // Matching criteria
  title_pattern?: string | null;
  system?: ExecutionSystem | null;
  creator?: CreatorType | null;
  priority?: TaskPriority[] | null;
  tags_include?: string[] | null;
  tags_exclude?: string[] | null;

  // Auto-approval settings
  auto_approve: boolean;
  auto_execute: boolean;
  default_priority?: TaskPriority | null;

  // Safety limits
  max_cost_usd?: number | null;
  require_refinement_if?: string | null;

  // Audit
  enabled: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;

  // Comment
  comment: string;
  comment_type: CommentType;

  // Author
  author_type: CreatorType;
  author_user_id?: string | null;
  author_agent?: string | null;

  // Metadata
  metadata?: Record<string, any> | null;

  created_at: string;
}

export interface TaskTemplate {
  id: string;

  // Template info
  name: string;
  description?: string | null;
  category?: string | null;

  // Template fields
  title_template?: string | null;
  description_template?: string | null;
  prompt_template?: string | null;
  system?: ExecutionSystem | null;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  tags?: string[] | null;

  // Auto-values
  auto_approve: boolean;

  // Usage tracking
  use_count: number;
  last_used_at?: string | null;

  // Audit
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// VIEW TYPES
// ============================================

export interface ApprovalQueueItem extends Task {
  comment_count: number;
  last_comment_at?: string | null;
}

export interface ExecutionQueueItem extends Task {
  execution_status: 'scheduled' | 'has_dependencies' | 'ready';
}

export interface TaskStatistics {
  status: TaskStatus;
  priority: TaskPriority;
  system: ExecutionSystem;
  created_by: CreatorType;
  task_count: number;
  avg_duration_seconds?: number | null;
}

// ============================================
// DTOs (Data Transfer Objects)
// ============================================

export interface CreateTaskDTO {
  title: string;
  description: string;
  prompt?: string;
  system: ExecutionSystem;
  custom_system?: string;
  execution_type?: ExecutionType;
  script_path?: string;
  script_args?: Record<string, any>;
  timeout_seconds?: number;
  priority?: TaskPriority;
  recurrence?: TaskRecurrence;
  recurrence_pattern?: string;
  scheduled_for?: string;
  execute_after?: string;
  deadline?: string;
  depends_on?: string[];
  blocks?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
  created_by?: CreatorType;
  created_by_agent?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  prompt?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  scheduled_for?: string;
  deadline?: string;
  refinement_notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ApproveTaskDTO {
  approved_by: string;
  auto_execute?: boolean;
}

export interface ExecuteTaskDTO {
  task_id: string;
  executed_by?: string;
}

export interface CompleteTaskDTO {
  output_summary?: string;
  output_data?: Record<string, any>;
  tokens_used?: number;
  cost_usd?: number;
  execution_log_path?: string;
}

export interface FailTaskDTO {
  error_message: string;
  execution_log_path?: string;
}

// ============================================
// FILTER AND QUERY TYPES
// ============================================

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  system?: ExecutionSystem | ExecutionSystem[];
  created_by?: CreatorType | CreatorType[];
  tags?: string[];
  search?: string;  // Search in title and description
  scheduled_from?: string;
  scheduled_to?: string;
  created_from?: string;
  created_to?: string;
}

export interface TaskSortOptions {
  field: 'created_at' | 'updated_at' | 'priority' | 'scheduled_for' | 'deadline';
  direction: 'asc' | 'desc';
}

export interface TaskQueryOptions {
  filters?: TaskFilters;
  sort?: TaskSortOptions;
  limit?: number;
  offset?: number;
}

// ============================================
// STATE MACHINE TYPES
// ============================================

export interface TaskStateTransition {
  from: TaskStatus;
  to: TaskStatus;
  action: string;
  requiredRole?: 'user' | 'agent' | 'system';
  validation?: (task: Task) => boolean;
}

export interface TaskWorkflow {
  currentState: TaskStatus;
  availableTransitions: TaskStateTransition[];
  canTransitionTo: (status: TaskStatus) => boolean;
  transition: (to: TaskStatus, data?: any) => Promise<Task>;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface TaskDashboardStats {
  total: number;
  by_status: Record<TaskStatus, number>;
  by_priority: Record<TaskPriority, number>;
  by_system: Record<ExecutionSystem, number>;
  pending_approval: number;
  in_progress: number;
  completed_today: number;
  failed_today: number;
}

export interface TaskListProps {
  filters?: TaskFilters;
  onTaskClick?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export interface TaskDetailProps {
  taskId: string;
  onClose?: () => void;
  onUpdate?: (task: Task) => void;
}

export interface TaskFormProps {
  task?: Task;  // For editing
  template?: TaskTemplate;  // For creating from template
  onSubmit?: (task: CreateTaskDTO | UpdateTaskDTO) => void;
  onCancel?: () => void;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  count?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// WEBHOOK/EVENT TYPES
// ============================================

export interface TaskEvent {
  type: 'task.created' | 'task.updated' | 'task.approved' | 'task.started' | 'task.completed' | 'task.failed';
  task: Task;
  previous?: Partial<Task>;  // For updates
  timestamp: string;
  triggered_by: string;
}

export interface TaskNotification {
  id: string;
  task_id: string;
  type: 'approval_required' | 'refinement_needed' | 'execution_failed' | 'deadline_approaching' | 'task_completed';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

// ============================================
// HELPER TYPES
// ============================================

export type TaskStatusGroup = 'pending' | 'active' | 'completed' | 'failed';

export const TASK_STATUS_GROUPS: Record<TaskStatusGroup, TaskStatus[]> = {
  pending: [TaskStatus.DRAFT, TaskStatus.PENDING_APPROVAL, TaskStatus.NEEDS_REFINEMENT],
  active: [TaskStatus.APPROVED, TaskStatus.IN_PROGRESS],
  completed: [TaskStatus.COMPLETED],
  failed: [TaskStatus.FAILED, TaskStatus.CANCELLED, TaskStatus.BLOCKED],
};

export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  [TaskPriority.CRITICAL]: 0,
  [TaskPriority.HIGH]: 1,
  [TaskPriority.MEDIUM]: 2,
  [TaskPriority.LOW]: 3,
  [TaskPriority.BACKLOG]: 4,
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: 'P0 - Critical',
  [TaskPriority.HIGH]: 'P1 - High',
  [TaskPriority.MEDIUM]: 'P2 - Medium',
  [TaskPriority.LOW]: 'P3 - Low',
  [TaskPriority.BACKLOG]: 'P4 - Backlog',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.CRITICAL]: '#DC2626',  // red-600
  [TaskPriority.HIGH]: '#EA580C',      // orange-600
  [TaskPriority.MEDIUM]: '#CA8A04',    // yellow-600
  [TaskPriority.LOW]: '#16A34A',       // green-600
  [TaskPriority.BACKLOG]: '#6B7280',   // gray-500
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.DRAFT]: '#9CA3AF',              // gray-400
  [TaskStatus.PENDING_APPROVAL]: '#F59E0B',   // amber-500
  [TaskStatus.NEEDS_REFINEMENT]: '#EF4444',   // red-500
  [TaskStatus.APPROVED]: '#10B981',           // green-500
  [TaskStatus.IN_PROGRESS]: '#3B82F6',        // blue-500
  [TaskStatus.COMPLETED]: '#059669',          // green-600
  [TaskStatus.FAILED]: '#DC2626',             // red-600
  [TaskStatus.CANCELLED]: '#6B7280',          // gray-500
  [TaskStatus.BLOCKED]: '#F97316',            // orange-500
};

export const SYSTEM_LABELS: Record<ExecutionSystem, string> = {
  [ExecutionSystem.AUTONOMOUS_AGENT]: 'Autonomous Agent',
  [ExecutionSystem.ASSET_GENERATOR]: 'Asset Generator',
  [ExecutionSystem.PROFESSIONAL]: 'Professional',
  [ExecutionSystem.PERSONAL]: 'Personal',
  [ExecutionSystem.PROJECTS]: 'Projects',
  [ExecutionSystem.CUSTOM]: 'Custom',
};

export const SYSTEM_ICONS: Record<ExecutionSystem, string> = {
  [ExecutionSystem.AUTONOMOUS_AGENT]: '🤖',
  [ExecutionSystem.ASSET_GENERATOR]: '💰',
  [ExecutionSystem.PROFESSIONAL]: '💼',
  [ExecutionSystem.PERSONAL]: '🌱',
  [ExecutionSystem.PROJECTS]: '🎮',
  [ExecutionSystem.CUSTOM]: '⚙️',
};
