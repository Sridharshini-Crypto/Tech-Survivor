import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('rounds')
      .select('*')
      .order('round_number', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('rounds')
      .insert({ ...body, created_by: session.entityId })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'create',
      entity_type: 'round',
      entity_id: data.id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { name: body.name },
    });

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

    const { id, action: roundAction, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Round ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (roundAction === 'activate') {
      await supabase.from('rounds').update({ status: 'ended' }).eq('status', 'active');
      updates.status = 'active';
      updates.start_time = new Date().toISOString();
    } else if (roundAction === 'pause') {
      updates.status = 'paused';
      updates.pause_time = new Date().toISOString();
    } else if (roundAction === 'resume') {
      updates.status = 'active';
      updates.pause_time = null;
    } else if (roundAction === 'end') {
      updates.status = 'ended';
      updates.end_time = new Date().toISOString();
    } else if (roundAction === 'reopen') {
      updates.status = 'active';
      updates.end_time = null;
    }

    const { data, error } = await supabase
      .from('rounds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const auditAction = roundAction
      ? (`${roundAction}_round` as 'start_round' | 'pause_round' | 'resume_round' | 'end_round')
      : 'update';

    await supabase.from('audit_log').insert({
      action: auditAction,
      entity_type: 'round',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { action: roundAction, ...updates },
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();
    const supabase = createAdminClient();
    const { error } = await supabase.from('rounds').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'delete',
      entity_type: 'round',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
