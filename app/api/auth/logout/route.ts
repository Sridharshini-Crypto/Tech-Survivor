import { NextResponse } from 'next/server';
import { clearAdminSession, clearTeamSession, getAdminSession, getTeamSession } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = createAdminClient();

    const adminSession = await getAdminSession();
    if (adminSession) {
      await supabase.from('audit_log').insert({
        action: 'logout',
        entity_type: 'admin',
        entity_id: adminSession.entityId,
        actor_type: 'admin',
        actor_id: adminSession.entityId,
      });
      await clearAdminSession();
    }

    const teamSession = await getTeamSession();
    if (teamSession) {
      await supabase
        .from('teams')
        .update({ is_online: false, presence: 'offline', last_seen: new Date().toISOString() })
        .eq('id', teamSession.entityId);

      await supabase
        .from('team_presence')
        .update({ status: 'offline' })
        .eq('team_id', teamSession.entityId);

      await supabase.from('audit_log').insert({
        action: 'logout',
        entity_type: 'team',
        entity_id: teamSession.entityId,
        actor_type: 'team',
        actor_id: teamSession.entityId,
      });
      await clearTeamSession();
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
