import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTeamSession, getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('violations')
      .select('*, team:teams(team_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const teamSession = await getTeamSession();
    if (!teamSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('violations')
      .insert({
        team_id: teamSession.entityId,
        round_id: body.round_id,
        violation_type: body.violation_type,
        description: body.description,
      })
      .select()
      .single();

    if (error) throw error;

    const { data: settings } = await supabase.from('event_settings').select('auto_lock_on_violation, max_violations_before_lock').single();
    if (settings?.auto_lock_on_violation) {
      const { count } = await supabase
        .from('violations')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamSession.entityId);

      if (count && count >= settings.max_violations_before_lock) {
        await supabase
          .from('teams')
          .update({ status: 'suspended' })
          .eq('id', teamSession.entityId);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, team_id, action_taken } = await request.json();
    const supabase = createAdminClient();

    await supabase
      .from('violations')
      .update({
        action_taken,
        action_by: session.entityId,
        action_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (action_taken === 'lock' || action_taken === 'suspend') {
      await supabase.from('teams').update({ status: 'suspended' }).eq('id', team_id);
    } else if (action_taken === 'disqualify') {
      await supabase.from('teams').update({ status: 'eliminated' }).eq('id', team_id);
    } else if (action_taken === 'remove') {
      await supabase.from('teams').update({ status: 'disabled' }).eq('id', team_id);
    }

    await supabase.from('audit_log').insert({
      action: 'violation',
      entity_type: 'violation',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { action_taken, team_id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
