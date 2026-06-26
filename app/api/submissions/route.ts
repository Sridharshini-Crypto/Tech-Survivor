import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getTeamSession, getAdminSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('team_id');
    const roundId = searchParams.get('round_id');
    const status = searchParams.get('status');

    const supabase = createAdminClient();
    let query = supabase.from('submissions').select('*, team:teams(team_name, avatar_url), question:questions(title, question_type, marks)').order('submitted_at', { ascending: false });

    if (teamId) query = query.eq('team_id', teamId);
    if (roundId) query = query.eq('round_id', roundId);
    if (status) query = query.eq('submission_status', status);

    const { data, error } = await query;
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

    const { data: round } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', body.round_id)
      .single();

    if (!round || round.status !== 'active') {
      return NextResponse.json({ error: 'Round is not active' }, { status: 400 });
    }

    if (round.submissions_locked) {
      return NextResponse.json({ error: 'Submissions are locked' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('submissions')
      .select('id')
      .eq('team_id', teamSession.entityId)
      .eq('question_id', body.question_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted an answer for this question' }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        team_id: teamSession.entityId,
        question_id: body.question_id,
        round_id: body.round_id,
        answer: body.answer,
        time_taken: body.time_taken,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'submit_answer',
      entity_type: 'submission',
      entity_id: data.id,
      actor_type: 'team',
      actor_id: teamSession.entityId,
      details: { question_id: body.question_id, round_id: body.round_id },
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

    const { id, marks_awarded, feedback, submission_status } = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('submissions')
      .update({
        marks_awarded,
        feedback,
        submission_status: submission_status || 'published',
        graded_by: session.entityId,
        graded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from('audit_log').insert({
      action: 'grade_answer',
      entity_type: 'submission',
      entity_id: id,
      actor_type: 'admin',
      actor_id: session.entityId,
      details: { marks_awarded, feedback },
    });

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
