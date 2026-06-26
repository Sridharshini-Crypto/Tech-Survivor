'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Layers, Plus, Play, Pause, RotateCcw, Square, Trash2, Copy, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { ROUND_STATUS_LABELS, ROUND_STATUS_COLORS } from '@/constants';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { Round } from '@/types';

export default function AdminRoundsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editRound, setEditRound] = useState<Round | null>(null);
  const [form, setForm] = useState({ name: '', description: '', round_number: 1, timer_duration: 60 });

  const { data: rounds = [], isLoading } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => fetch('/api/rounds').then((r) => r.json()),
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rounds'] });
  }, [queryClient]);
  useRealtimeSubscription('rounds', realtimeCallback);

  const createRound = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/rounds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rounds'] }); setShowCreate(false); toast.success('Round created'); },
  });

  const updateRound = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/rounds', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rounds'] }); setEditRound(null); toast.success('Round updated'); },
  });

  const deleteRound = useMutation({
    mutationFn: (id: string) =>
      fetch('/api/rounds', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['rounds'] }); toast.success('Round deleted'); },
  });

  const handleAction = (id: string, action: string) => {
    updateRound.mutate({ id, action });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Round Management</h1>
          <p className="text-sm text-zinc-500">{rounds.length} rounds</p>
        </div>
        <Button onClick={() => { setForm({ name: '', description: '', round_number: rounds.length + 1, timer_duration: 60 }); setShowCreate(true); }}>
          <Plus className="h-4 w-4" /> Create Round
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Rounds</h2>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : rounds.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No rounds created yet</p>
          ) : (
            <div className="space-y-3">
              {rounds.map((round) => (
                <div key={round.id} className="flex items-center gap-4 p-4 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold">
                    {round.round_number}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-200">{round.name}</p>
                    <p className="text-xs text-zinc-500">{round.timer_duration}s timer &middot; {round.description || 'No description'}</p>
                  </div>
                  <Badge className={ROUND_STATUS_COLORS[round.status]}>{ROUND_STATUS_LABELS[round.status]}</Badge>
                  <div className="flex items-center gap-1">
                    {round.status === 'draft' && (
                      <button onClick={() => handleAction(round.id, 'activate')} className="p-1.5 rounded hover:bg-green-500/10 text-green-500" title="Start">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {round.status === 'active' && (
                      <>
                        <button onClick={() => handleAction(round.id, 'pause')} className="p-1.5 rounded hover:bg-yellow-500/10 text-yellow-500" title="Pause">
                          <Pause className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleAction(round.id, 'end')} className="p-1.5 rounded hover:bg-red-500/10 text-red-500" title="End">
                          <Square className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {round.status === 'paused' && (
                      <button onClick={() => handleAction(round.id, 'resume')} className="p-1.5 rounded hover:bg-green-500/10 text-green-500" title="Resume">
                        <Play className="h-4 w-4" />
                      </button>
                    )}
                    {round.status === 'ended' && (
                      <button onClick={() => handleAction(round.id, 'reopen')} className="p-1.5 rounded hover:bg-blue-500/10 text-blue-500" title="Reopen">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => { setEditRound(round); setForm({ name: round.name, description: round.description || '', round_number: round.round_number, timer_duration: round.timer_duration }); }} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500">
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button onClick={() => createRound.mutate({ name: `${round.name} (Copy)`, description: round.description, round_number: rounds.length + 1, timer_duration: round.timer_duration })} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500" title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => { if (confirm('Delete this round?')) deleteRound.mutate(round.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate || !!editRound} onClose={() => { setShowCreate(false); setEditRound(null); }} title={editRound ? 'Edit Round' : 'Create Round'}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editRound) {
              updateRound.mutate({ id: editRound.id, ...form });
            } else {
              createRound.mutate(form);
            }
          }}
          className="space-y-4"
        >
          <Input label="Round Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Round Number" type="number" value={form.round_number} onChange={(e) => setForm({ ...form, round_number: parseInt(e.target.value) })} />
            <Input label="Timer (seconds)" type="number" value={form.timer_duration} onChange={(e) => setForm({ ...form, timer_duration: parseInt(e.target.value) })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => { setShowCreate(false); setEditRound(null); }}>Cancel</Button>
            <Button type="submit" loading={createRound.isPending || updateRound.isPending}>{editRound ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
