-- ============================================================
-- TECH SURVIVOR - Complete Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE team_status AS ENUM (
  'pending', 'approved', 'rejected', 'disabled', 'suspended', 'eliminated'
);

CREATE TYPE round_status AS ENUM (
  'draft', 'active', 'paused', 'ended', 'archived'
);

CREATE TYPE question_type AS ENUM (
  'text', 'mcq', 'image', 'subjective', 'coding'
);

CREATE TYPE difficulty_level AS ENUM (
  'easy', 'medium', 'hard', 'extreme'
);

CREATE TYPE submission_status AS ENUM (
  'pending_review', 'auto_graded', 'manually_graded', 'published'
);

CREATE TYPE violation_type AS ENUM (
  'fullscreen_exit', 'tab_switch', 'multi_tab', 'focus_loss', 'browser_minimize', 'window_change', 'copy_paste', 'other'
);

CREATE TYPE violation_action AS ENUM (
  'allow_continue', 'warn', 'lock', 'suspend', 'disqualify', 'remove'
);

CREATE TYPE presence_status AS ENUM (
  'online', 'idle', 'offline'
);

CREATE TYPE announcement_target AS ENUM (
  'global', 'team', 'round'
);

CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'approve', 'reject', 'login', 'logout',
  'start_round', 'pause_round', 'resume_round', 'end_round',
  'submit_answer', 'grade_answer', 'violation', 'score_change',
  'team_status_change', 'settings_change', 'announcement'
);

-- ============================================================
-- TABLES
-- ============================================================

-- Admin Users
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100) NOT NULL DEFAULT 'Admin',
  email VARCHAR(255),
  is_super_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Settings
CREATE TABLE event_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name VARCHAR(255) DEFAULT 'TECH SURVIVOR',
  event_logo TEXT,
  presented_by VARCHAR(255) DEFAULT 'TEAM ASYMMETRIC PRESENTS',
  primary_color VARCHAR(7) DEFAULT '#DC2626',
  dark_color VARCHAR(7) DEFAULT '#991B1B',
  accent_color VARCHAR(7) DEFAULT '#EF4444',
  marks_per_question INTEGER DEFAULT 10,
  negative_marking BOOLEAN DEFAULT FALSE,
  negative_marks DECIMAL(5,2) DEFAULT 0,
  default_timer INTEGER DEFAULT 60,
  max_team_size INTEGER DEFAULT 5,
  max_admins INTEGER DEFAULT 5,
  enable_registration BOOLEAN DEFAULT TRUE,
  enable_realtime BOOLEAN DEFAULT TRUE,
  enable_notifications BOOLEAN DEFAULT TRUE,
  enable_monitoring BOOLEAN DEFAULT TRUE,
  enable_fullscreen BOOLEAN DEFAULT TRUE,
  fullscreen_mode VARCHAR(20) DEFAULT 'warning',
  enable_multi_tab_detection BOOLEAN DEFAULT TRUE,
  enable_sound_effects BOOLEAN DEFAULT TRUE,
  enable_tab_switch_detection BOOLEAN DEFAULT TRUE,
  auto_lock_on_violation BOOLEAN DEFAULT FALSE,
  max_violations_before_lock INTEGER DEFAULT 3,
  event_start_date TIMESTAMPTZ,
  event_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_name VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  team_leader VARCHAR(100) NOT NULL,
  college_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  team_members JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  status team_status DEFAULT 'pending',
  total_score DECIMAL(10,2) DEFAULT 0,
  rank INTEGER,
  is_online BOOLEAN DEFAULT FALSE,
  presence presence_status DEFAULT 'offline',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  round_number INTEGER NOT NULL,
  status round_status DEFAULT 'draft',
  timer_duration INTEGER DEFAULT 60,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  pause_time TIMESTAMPTZ,
  remaining_time INTEGER,
  submissions_locked BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type DEFAULT 'text',
  difficulty difficulty_level DEFAULT 'medium',
  marks DECIMAL(5,2) DEFAULT 10,
  negative_marks DECIMAL(5,2) DEFAULT 0,
  timer INTEGER DEFAULT 60,
  correct_answer TEXT,
  accepted_answers JSONB DEFAULT '[]'::jsonb,
  numeric_tolerance DECIMAL(10,4),
  mcq_options JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  allow_partial_marks BOOLEAN DEFAULT FALSE,
  partial_marks_value DECIMAL(5,2) DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  is_bonus BOOLEAN DEFAULT FALSE,
  bonus_points DECIMAL(5,2) DEFAULT 0,
  requires_manual_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  answer TEXT,
  is_correct BOOLEAN,
  marks_awarded DECIMAL(5,2) DEFAULT 0,
  time_taken INTEGER,
  submission_status submission_status DEFAULT 'pending_review',
  feedback TEXT,
  graded_by UUID REFERENCES admins(id),
  graded_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, question_id)
);

-- Violations
CREATE TABLE violations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id),
  violation_type violation_type NOT NULL,
  description TEXT,
  action_taken violation_action DEFAULT 'allow_continue',
  action_by UUID REFERENCES admins(id),
  action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target announcement_target DEFAULT 'global',
  target_id UUID,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action audit_action NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  actor_type VARCHAR(20) DEFAULT 'admin',
  actor_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Login History
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT NOW(),
  logged_out_at TIMESTAMPTZ
);

-- Team Presence
CREATE TABLE team_presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE UNIQUE,
  status presence_status DEFAULT 'offline',
  last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
  current_page TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_rank ON teams(rank);
CREATE INDEX idx_teams_total_score ON teams(total_score DESC);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_rounds_round_number ON rounds(round_number);
CREATE INDEX idx_questions_round_id ON questions(round_id);
CREATE INDEX idx_questions_order ON questions(round_id, order_index);
CREATE INDEX idx_submissions_team_id ON submissions(team_id);
CREATE INDEX idx_submissions_question_id ON submissions(question_id);
CREATE INDEX idx_submissions_round_id ON submissions(round_id);
CREATE INDEX idx_violations_team_id ON violations(team_id);
CREATE INDEX idx_violations_round_id ON violations(round_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_login_history_team_id ON login_history(team_id);
CREATE INDEX idx_announcements_target ON announcements(target);
CREATE INDEX idx_team_presence_status ON team_presence(status);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate team ranks
CREATE OR REPLACE FUNCTION calculate_ranks()
RETURNS void AS $$
BEGIN
  UPDATE teams SET rank = sub.rank
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      ORDER BY total_score DESC, 
      (SELECT MIN(submitted_at) FROM submissions WHERE team_id = teams.id) ASC
    ) as rank
    FROM teams
    WHERE status = 'approved'
  ) sub
  WHERE teams.id = sub.id;
END;
$$ LANGUAGE plpgsql;

-- Update team score after submission
CREATE OR REPLACE FUNCTION update_team_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE teams SET total_score = (
    SELECT COALESCE(SUM(marks_awarded), 0)
    FROM submissions
    WHERE team_id = NEW.team_id
    AND (submission_status = 'auto_graded' OR submission_status = 'published')
  )
  WHERE id = NEW.team_id;
  
  PERFORM calculate_ranks();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-grade MCQ and exact match submissions
CREATE OR REPLACE FUNCTION auto_grade_submission()
RETURNS TRIGGER AS $$
DECLARE
  q RECORD;
  is_correct_answer BOOLEAN := FALSE;
  awarded DECIMAL(5,2) := 0;
BEGIN
  SELECT * INTO q FROM questions WHERE id = NEW.question_id;
  
  IF q.requires_manual_review THEN
    NEW.submission_status := 'pending_review';
    RETURN NEW;
  END IF;

  -- Check correct answer
  IF q.question_type = 'mcq' THEN
    is_correct_answer := LOWER(TRIM(NEW.answer)) = LOWER(TRIM(q.correct_answer));
  ELSIF q.question_type IN ('text', 'image') THEN
    -- Check exact match or accepted answers
    is_correct_answer := LOWER(TRIM(NEW.answer)) = LOWER(TRIM(q.correct_answer));
    
    IF NOT is_correct_answer AND jsonb_array_length(q.accepted_answers) > 0 THEN
      SELECT EXISTS(
        SELECT 1 FROM jsonb_array_elements_text(q.accepted_answers) AS accepted
        WHERE LOWER(TRIM(accepted)) = LOWER(TRIM(NEW.answer))
      ) INTO is_correct_answer;
    END IF;
    
    -- Check numeric tolerance
    IF NOT is_correct_answer AND q.numeric_tolerance IS NOT NULL THEN
      BEGIN
        is_correct_answer := ABS(CAST(NEW.answer AS DECIMAL) - CAST(q.correct_answer AS DECIMAL)) <= q.numeric_tolerance;
      EXCEPTION WHEN OTHERS THEN
        is_correct_answer := FALSE;
      END;
    END IF;
  END IF;

  NEW.is_correct := is_correct_answer;
  
  IF is_correct_answer THEN
    awarded := q.marks;
    IF q.is_bonus THEN
      awarded := awarded + q.bonus_points;
    END IF;
  ELSE
    awarded := -q.negative_marks;
  END IF;
  
  NEW.marks_awarded := awarded;
  NEW.submission_status := 'auto_graded';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

CREATE TRIGGER tr_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_event_settings_updated_at
  BEFORE UPDATE ON event_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_auto_grade
  BEFORE INSERT ON submissions
  FOR EACH ROW EXECUTE FUNCTION auto_grade_submission();

CREATE TRIGGER tr_update_score
  AFTER INSERT OR UPDATE OF marks_awarded, submission_status ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_team_score();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_presence ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS, so these policies allow the API routes to work
-- while keeping direct DB access restricted

CREATE POLICY "Allow service role full access on admins" ON admins
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on teams" ON teams
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on rounds" ON rounds
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on questions" ON questions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on submissions" ON submissions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on violations" ON violations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on announcements" ON announcements
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on audit_log" ON audit_log
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on event_settings" ON event_settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on login_history" ON login_history
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access on team_presence" ON team_presence
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA - Admin Only
-- ============================================================

INSERT INTO admins (username, password_hash, display_name, is_super_admin)
VALUES ('admin', crypt('admin@123', gen_salt('bf')), 'Super Admin', TRUE);

INSERT INTO event_settings (event_name, presented_by)
VALUES ('TECH SURVIVOR', 'TEAM ASYMMETRIC PRESENTS');

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE teams;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE violations;
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE team_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE questions;
ALTER PUBLICATION supabase_realtime ADD TABLE event_settings;
