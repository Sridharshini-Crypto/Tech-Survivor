import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    const [
      { count: totalTeams },
      { count: approvedTeams },
      { count: pendingTeams },
      { count: onlineTeams },
      { count: totalViolations },
      { count: totalSubmissions },
      { data: rounds },
      { data: submissions },
      { data: teams },
    ] = await Promise.all([
      supabase.from('teams').select('*', { count: 'exact', head: true }),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('teams').select('*', { count: 'exact', head: true }).eq('is_online', true),
      supabase.from('violations').select('*', { count: 'exact', head: true }),
      supabase.from('submissions').select('*', { count: 'exact', head: true }),
      supabase.from('rounds').select('*').order('round_number'),
      supabase.from('submissions').select('is_correct, marks_awarded, question_id'),
      supabase.from('teams').select('id, team_name, total_score, status').eq('status', 'approved').order('total_score', { ascending: false }).limit(10),
    ]);

    const correctSubmissions = (submissions || []).filter((s) => s.is_correct).length;
    const totalSubs = submissions?.length || 1;
    const accuracyRate = Math.round((correctSubmissions / totalSubs) * 100);
    const avgScore = teams?.length
      ? Math.round((teams.reduce((sum, t) => sum + (t.total_score || 0), 0) / teams.length) * 100) / 100
      : 0;

    return NextResponse.json({
      totalTeams: totalTeams || 0,
      approvedTeams: approvedTeams || 0,
      pendingTeams: pendingTeams || 0,
      onlineTeams: onlineTeams || 0,
      totalViolations: totalViolations || 0,
      totalSubmissions: totalSubmissions || 0,
      accuracyRate,
      avgScore,
      rounds: rounds || [],
      topTeams: teams || [],
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
