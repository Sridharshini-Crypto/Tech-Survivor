export type TeamStatus = 'pending' | 'approved' | 'rejected' | 'disabled' | 'suspended' | 'eliminated';
export type RoundStatus = 'draft' | 'active' | 'paused' | 'ended' | 'archived';
export type QuestionType = 'text' | 'mcq' | 'image' | 'subjective' | 'coding';
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';
export type SubmissionStatus = 'pending_review' | 'auto_graded' | 'manually_graded' | 'published';
export type ViolationType = 'fullscreen_exit' | 'tab_switch' | 'multi_tab' | 'focus_loss' | 'browser_minimize' | 'window_change' | 'copy_paste' | 'other';
export type ViolationAction = 'allow_continue' | 'warn' | 'lock' | 'suspend' | 'disqualify' | 'remove';
export type PresenceStatus = 'online' | 'idle' | 'offline';
export type AnnouncementTarget = 'global' | 'team' | 'round';
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'login' | 'logout' | 'start_round' | 'pause_round' | 'resume_round' | 'end_round' | 'submit_answer' | 'grade_answer' | 'violation' | 'score_change' | 'team_status_change' | 'settings_change' | 'announcement';

export interface Admin {
  id: string;
  username: string;
  display_name: string;
  email?: string;
  is_super_admin: boolean;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  name: string;
  role?: string;
}

export interface Team {
  id: string;
  team_name: string;
  team_leader: string;
  college_name: string;
  contact_number: string;
  team_members: TeamMember[];
  avatar_url?: string;
  status: TeamStatus;
  total_score: number;
  rank?: number;
  is_online: boolean;
  presence: PresenceStatus;
  last_seen: string;
  session_id?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Round {
  id: string;
  name: string;
  description?: string;
  round_number: number;
  status: RoundStatus;
  timer_duration: number;
  start_time?: string;
  end_time?: string;
  pause_time?: string;
  remaining_time?: number;
  submissions_locked: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MCQOption {
  id: string;
  text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  round_id: string;
  title: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  marks: number;
  negative_marks: number;
  timer: number;
  correct_answer?: string;
  accepted_answers: string[];
  numeric_tolerance?: number;
  mcq_options: MCQOption[];
  image_url?: string;
  allow_partial_marks: boolean;
  partial_marks_value: number;
  order_index: number;
  is_bonus: boolean;
  bonus_points: number;
  requires_manual_review: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  team_id: string;
  question_id: string;
  round_id: string;
  answer?: string;
  is_correct?: boolean;
  marks_awarded: number;
  time_taken?: number;
  submission_status: SubmissionStatus;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  submitted_at: string;
  team?: Team;
  question?: Question;
}

export interface Violation {
  id: string;
  team_id: string;
  round_id?: string;
  violation_type: ViolationType;
  description?: string;
  action_taken: ViolationAction;
  action_by?: string;
  action_at?: string;
  created_at: string;
  team?: Team;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  target: AnnouncementTarget;
  target_id?: string;
  is_urgent: boolean;
  created_by?: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity_type?: string;
  entity_id?: string;
  actor_type: string;
  actor_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface EventSettings {
  id: string;
  event_name: string;
  event_logo?: string;
  presented_by: string;
  primary_color: string;
  dark_color: string;
  accent_color: string;
  marks_per_question: number;
  negative_marking: boolean;
  negative_marks: number;
  default_timer: number;
  max_team_size: number;
  max_admins: number;
  enable_registration: boolean;
  enable_realtime: boolean;
  enable_notifications: boolean;
  enable_monitoring: boolean;
  enable_fullscreen: boolean;
  fullscreen_mode: string;
  enable_multi_tab_detection: boolean;
  enable_sound_effects: boolean;
  enable_tab_switch_detection: boolean;
  auto_lock_on_violation: boolean;
  max_violations_before_lock: number;
  event_start_date?: string;
  event_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamPresence {
  id: string;
  team_id: string;
  status: PresenceStatus;
  last_heartbeat: string;
  current_page?: string;
  updated_at: string;
}

export interface LoginHistory {
  id: string;
  team_id: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  logged_in_at: string;
  logged_out_at?: string;
}
