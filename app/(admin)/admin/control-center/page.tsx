'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings2, Play, Pause, Square, RotateCcw, Lock, Unlock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROUND_STATUS_LABELS, ROUND_STATUS_COLORS } from '@/constants';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { Round } from '@/types';

export default function ControlCenterPage() {
  const queryClient = useQueryClient();

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => fetch('/api/rounds').then((r) => r.json()),
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rounds'] });
  }, [queryClient]);
  useRealtimeSubscription('rounds', realtimeCallback);

  const mutate = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/rounds', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rounds'] }); toast.success('Action performed'); },
  });

  const activeRound = rounds.find((r) => r.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Event Control Center</h1>
        <p className="text-sm text-zinc-500">Control rounds, timers, and submissions in real-time</p>
      </div>

      {activeRound ? (
        <Card glow>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-red-400" />
                <h2 className="text-lg font-semibold text-zinc-100">Active: {activeRound.name}</h2>
              </div>
              <Badge className={ROUND_STATUS_COLORS[activeRound.status]}>{ROUND_STATUS_LABELS[activeRound.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Clock className="h-4 w-4" />
              Timer: {activeRound.timer_duration}s
              {activeRound.submissions_locked && <Badge variant="danger">Submissions Locked</Badge>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button onClick={() => mutate.mutate({ id: activeRound.id, action: 'pause' })} variant="secondary">
                <Pause className="h-4 w-4" /> Pause
              </Button>
              <Button onClick={() => mutate.mutate({ id: activeRound.id, action: 'end' })} variant="danger">
                <Square className="h-4 w-4" /> End Round
              </Button>
              <Button
                onClick={() => mutate.mutate({ id: activeRound.id, submissions_locked: !activeRound.submissions_locked })}
                variant="secondary"
              >
                {activeRound.submissions_locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {activeRound.submissions_locked ? 'Unlock' : 'Lock'} Submissions
              </Button>
              <Button
                onClick={() => mutate.mutate({ id: activeRound.id, timer_duration: activeRound.timer_duration + 30 })}
                variant="secondary"
              >
                <Clock className="h-4 w-4" /> +30s
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500">No active round. Start a round from the Rounds page.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-zinc-100">All Rounds</h2></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {rounds.map((round) => (
              <div key={round.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30">
                <span className="font-bold text-red-400">R{round.round_number}</span>
                <span className="flex-1 text-sm text-zinc-200">{round.name}</span>
                <Badge className={ROUND_STATUS_COLORS[round.status]}>{ROUND_STATUS_LABELS[round.status]}</Badge>
                <div className="flex gap-1">
                  {round.status === 'draft' && (
                    <Button size="sm" onClick={() => mutate.mutate({ id: round.id, action: 'activate' })}><Play className="h-3 w-3" /> Start</Button>
                  )}
                  {round.status === 'paused' && (
                    <Button size="sm" onClick={() => mutate.mutate({ id: round.id, action: 'resume' })}><Play className="h-3 w-3" /> Resume</Button>
                  )}
                  {round.status === 'ended' && (
                    <Button size="sm" variant="secondary" onClick={() => mutate.mutate({ id: round.id, action: 'reopen' })}><RotateCcw className="h-3 w-3" /> Reopen</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
