import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createTeamSession } from '@/lib/auth';

const STATUS_MESSAGES: Record<string, string> = {
  pending: 'Your registration is awaiting admin approval.',
  rejected: 'Your registration has been rejected.',
  disabled: 'Your account has been disabled.',
  suspended: 'Your account has been suspended.',
  eliminated: 'Your team has been eliminated from the competition.',
};

export async function POST(request: Request) {
  try {
    const { team_name, password } = await request.json();
    if (!team_name || !password) {
      return NextResponse.json({ error: 'Team name and password are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: team, error } = await supabase
      .from('teams')
      .select('*')
      .eq('team_name', team_name)
      .single();

    if (error || !team) {
      return NextResponse.json({ error: 'Invalid team name or password' }, { status: 401 });
    }

    if (team.status !== 'approved') {
      const message = STATUS_MESSAGES[team.status] || 'Your account is not active.';
      return NextResponse.json({ error: message, status: team.status }, { status: 403 });
    }

    const { data: isValid } = await supabase.rpc('verify_password', {
      password_text: password,
      password_hash: team.password_hash,
    });

    if (!isValid) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      const computed = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      if (computed !== team.password_hash) {
        return NextResponse.json({ error: 'Invalid team name or password' }, { status: 401 });
      }
    }

    const sessionId = await createTeamSession(team.id);

    await supabase
      .from('teams')
      .update({ is_online: true, presence: 'online', last_seen: new Date().toISOString(), session_id: sessionId })
      .eq('id', team.id);

    await supabase.from('team_presence').upsert({
      team_id: team.id,
      status: 'online',
      last_heartbeat: new Date().toISOString(),
    }, { onConflict: 'team_id' });

    await supabase.from('login_history').insert({
      team_id: team.id,
      session_id: sessionId,
      logged_in_at: new Date().toISOString(),
    });

    await supabase.from('audit_log').insert({
      action: 'login',
      entity_type: 'team',
      entity_id: team.id,
      actor_type: 'team',
      actor_id: team.id,
      details: { team_name: team.team_name },
    });

    const { password_hash: _, ...safeTeam } = team;
    return NextResponse.json({ team: safeTeam, sessionId });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
