'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { Submission } from '@/types';

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Submission | null>(null);
  const [marks, setMarks] = useState('');
  const [feedback, setFeedback] = useState('');

  const { data: submissions = [], isLoading } = useQuery<Submission[]>({
    queryKey: ['submissions-review'],
    queryFn: () => fetch('/api/submissions?status=pending_review').then((r) => r.json()),
  });

  const grade = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/submissions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['submissions-review'] }); setSelected(null); toast.success('Graded successfully'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Manual Review</h1>
        <p className="text-sm text-zinc-500">{submissions.length} submissions awaiting review</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><CheckSquare className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-zinc-100">Pending Reviews</h2></div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : submissions.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No pending reviews</p>
          ) : (
            <div className="space-y-2">
              {submissions.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 cursor-pointer hover:bg-zinc-800/50" onClick={() => { setSelected(s); setMarks(''); setFeedback(''); }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{s.question?.title || 'Question'}</p>
                    <p className="text-xs text-zinc-500">{(s.team as { team_name?: string })?.team_name || 'Team'} &middot; {formatDate(s.submitted_at)}</p>
                  </div>
                  <Badge variant="warning">Pending Review</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Grade Submission" size="lg">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Question</p>
              <p className="text-zinc-200">{selected.question?.title}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Answer</p>
              <div className="p-3 rounded-lg bg-zinc-800 text-sm text-zinc-300 whitespace-pre-wrap">{selected.answer || 'No answer'}</div>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Max Marks: {selected.question?.marks}</p>
            </div>
            <Input label="Marks Awarded" type="number" value={marks} onChange={(e) => setMarks(e.target.value)} />
            <Textarea label="Feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setSelected(null)}>Cancel</Button>
              <Button onClick={() => grade.mutate({ id: selected.id, marks_awarded: Number(marks), feedback, submission_status: 'published' })} loading={grade.isPending}>
                Publish Score
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
