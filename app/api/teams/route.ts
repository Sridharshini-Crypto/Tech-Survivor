import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = createAdminClient();
    let query = supabase
      .from('teams')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const safe = (data || []).map(({ password_hash: _, ...t }) => t);
    return NextResponse.json(safe);
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

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (updates.status === 'approved') {
      updates.approved_at = new Date().toISOString();
      updates.approved_by = session.entityId;
    }

    const { data, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: updates.status ? 'team_status_change' : 'update',
      entity_type: 'team',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: updates,
    });

    const { password_hash: _, ...safe } = data;
    return NextResponse.json(safe);
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
    if (!id) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('teams').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'delete',
      entity_type: 'team',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
