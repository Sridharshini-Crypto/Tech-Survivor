'use client';

import { useQuery } from '@tanstack/react-query';
import { History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useTeamAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import type { Submission } from '@/types';

export default function TeamHistoryPage() {
  const { team } = useTeamAuth();

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ['submissions', team?.id],
    queryFn: () => fetch(`/api/submissions?team_id=${team?.id}`).then((r) => r.json()),
    enabled: !!team,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Submission History</h1>
        <p className="text-sm text-zinc-500">{submissions.length} submissions</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><History className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-zinc-100">Your Submissions</h2></div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : submissions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No submissions yet</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    s.is_correct ? 'bg-green-500/20 text-green-400' :
                    s.is_correct === false ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {s.is_correct ? <CheckCircle className="h-4 w-4" /> :
                     s.is_correct === false ? <XCircle className="h-4 w-4" /> :
                     <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{(s.question as { title?: string })?.title || 'Question'}</p>
                    <p className="text-xs text-zinc-500">Answer: {s.answer} &middot; {s.time_taken ? `${s.time_taken}s` : ''}</p>
                  </div>
                  <span className={`text-sm font-bold ${s.marks_awarded > 0 ? 'text-green-400' : s.marks_awarded < 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                    {s.marks_awarded > 0 ? '+' : ''}{s.marks_awarded} pts
                  </span>
                  <Badge variant={s.submission_status === 'auto_graded' || s.submission_status === 'published' ? 'success' : 'warning'}>
                    {s.submission_status}
                  </Badge>
                  <span className="text-xs text-zinc-600">{formatDate(s.submitted_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
