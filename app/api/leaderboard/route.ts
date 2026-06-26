import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('teams')
      .select('id, team_name, avatar_url, total_score, rank, status, college_name, presence')
      .eq('status', 'approved')
      .order('total_score', { ascending: false });

    if (error) throw error;

    const ranked = (data || []).map((team, index) => ({
      ...team,
      rank: index + 1,
    }));

    return NextResponse.json(ranked);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
