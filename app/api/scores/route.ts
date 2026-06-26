import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function PATCH(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team_id, score_change, reason } = await request.json();
    const supabase = createAdminClient();

    const { data: team } = await supabase
      .from('teams')
      .select('total_score')
      .eq('id', team_id)
      .single();

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const newScore = (team.total_score || 0) + score_change;
    const { data, error } = await supabase
      .from('teams')
      .update({ total_score: newScore })
      .eq('id', team_id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'score_change',
      entity_type: 'team',
      entity_id: team_id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { score_change, reason, new_total: newScore },
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
