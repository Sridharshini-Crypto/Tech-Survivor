import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('event_settings').select('*').single();
    if (error) throw error;
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

    const updates = await request.json();
    const supabase = createAdminClient();

    const { data: current } = await supabase.from('event_settings').select('id').single();
    if (!current) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('event_settings')
      .update(updates)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'settings_change',
      entity_type: 'event_settings',
      entity_id: current.id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: updates,
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
