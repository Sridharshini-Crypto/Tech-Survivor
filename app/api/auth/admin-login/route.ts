import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error || !admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { data: isValid } = await supabase.rpc('verify_password', {
      password_text: password,
      password_hash: admin.password_hash,
    });

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    const sessionId = await createAdminSession(admin.id);

    await supabase.from('audit_log').insert({
      action: 'login',
      entity_type: 'admin',
      entity_id: admin.id,
      actor_type: 'admin',
      actor_id: admin.id,
      details: { username: admin.username },
    });

    const { password_hash: _, ...safeAdmin } = admin;
    return NextResponse.json({ admin: safeAdmin, sessionId });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
