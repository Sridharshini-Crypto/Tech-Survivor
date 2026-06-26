import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundId = searchParams.get('round_id');

    const supabase = createAdminClient();
    let query = supabase.from('questions').select('*').order('order_index', { ascending: true });

    if (roundId) {
      query = query.eq('round_id', roundId);
    }

    const { data, error } = await query;
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
      .from('questions')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'create',
      entity_type: 'question',
      entity_id: data.id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { title: body.title, round_id: body.round_id },
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

    const { id, ...updates } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'update',
      entity_type: 'question',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
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
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'delete',
      entity_type: 'question',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
