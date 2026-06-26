import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { team_name, password, team_leader, college_name, contact_number, team_members, avatar_url } = body;

    if (!team_name || !password || !team_leader || !college_name || !contact_number) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: settings } = await supabase.from('event_settings').select('enable_registration').single();
    if (settings && !settings.enable_registration) {
      return NextResponse.json({ error: 'Registration is currently closed' }, { status: 403 });
    }

    const { data: existing } = await supabase
      .from('teams')
      .select('id')
      .eq('team_name', team_name)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Team name already taken' }, { status: 409 });
    }

    const { data: hashResult } = await supabase.rpc('crypt_password', {
      password_text: password,
    });

    let passwordHash = hashResult;
    if (!passwordHash) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hash = await crypto.subtle.digest('SHA-256', data);
      passwordHash = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        team_name,
        password_hash: passwordHash,
        team_leader,
        college_name,
        contact_number,
        team_members: team_members || [],
        avatar_url: avatar_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to register team' }, { status: 500 });
    }

    await supabase.from('audit_log').insert({
      action: 'create',
      entity_type: 'team',
      entity_id: team.id,
      actor_type: 'team',
      actor_id: team.id,
      details: { team_name, team_leader, college_name },
    });

    return NextResponse.json({
      message: 'Your registration request has been submitted successfully. Please wait for admin approval.',
      team_id: team.id,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
