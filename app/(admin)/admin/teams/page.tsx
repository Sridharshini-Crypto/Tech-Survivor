'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Users, Search, CheckCircle, XCircle, Ban, Trash2, RotateCcw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { TEAM_STATUS_LABELS, TEAM_STATUS_COLORS, PRESENCE_COLORS } from '@/constants';
import { formatDate, generateAvatar } from '@/lib/utils';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { Team } from '@/types';

export default function AdminTeamsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams', statusFilter],
    queryFn: () => fetch(`/api/teams?status=${statusFilter}`).then((r) => r.json()),
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['teams'] });
  }, [queryClient]);

  useRealtimeSubscription('teams', realtimeCallback);

  const updateTeam = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      fetch('/api/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team updated');
    },
    onError: () => toast.error('Failed to update team'),
  });

  const deleteTeam = useMutation({
    mutationFn: (id: string) =>
      fetch('/api/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted');
    },
  });

  const filtered = teams.filter((t) =>
    t.team_name.toLowerCase().includes(search.toLowerCase()) ||
    t.college_name.toLowerCase().includes(search.toLowerCase())
  );

  const statuses = ['all', 'pending', 'approved', 'rejected', 'disabled', 'suspended', 'eliminated'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Team Management</h1>
          <p className="text-sm text-zinc-500">{teams.length} teams total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {s === 'all' ? 'All' : TEAM_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <Input
        placeholder="Search teams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="h-4 w-4" />}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Teams</h2>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={8} />
          ) : filtered.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No teams found</p>
          ) : (
            <div className="space-y-2">
              {filtered.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={team.avatar_url || generateAvatar(team.team_name)}
                      alt={team.team_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${PRESENCE_COLORS[team.presence]}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{team.team_name}</p>
                    <p className="text-xs text-zinc-500">{team.college_name} &middot; {team.team_leader}</p>
                  </div>
                  <Badge className={TEAM_STATUS_COLORS[team.status]}>
                    {TEAM_STATUS_LABELS[team.status]}
                  </Badge>
                  <span className="text-sm font-semibold text-zinc-300">{team.total_score} pts</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedTeam(team)} className="p-1.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-300">
                      <Eye className="h-4 w-4" />
                    </button>
                    {team.status === 'pending' && (
                      <>
                        <button onClick={() => updateTeam.mutate({ id: team.id, status: 'approved' })} className="p-1.5 rounded hover:bg-green-500/10 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button onClick={() => updateTeam.mutate({ id: team.id, status: 'rejected' })} className="p-1.5 rounded hover:bg-red-500/10 text-red-500">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {team.status === 'approved' && (
                      <button onClick={() => updateTeam.mutate({ id: team.id, status: 'suspended' })} className="p-1.5 rounded hover:bg-orange-500/10 text-orange-500">
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                    {(team.status === 'suspended' || team.status === 'disabled') && (
                      <button onClick={() => updateTeam.mutate({ id: team.id, status: 'approved' })} className="p-1.5 rounded hover:bg-green-500/10 text-green-500">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => { if (confirm('Delete this team?')) deleteTeam.mutate(team.id); }} className="p-1.5 rounded hover:bg-red-500/10 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} title="Team Details" size="lg">
        {selectedTeam && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={selectedTeam.avatar_url || generateAvatar(selectedTeam.team_name)} alt="" className="w-16 h-16 rounded-full" />
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{selectedTeam.team_name}</h3>
                <p className="text-sm text-zinc-500">{selectedTeam.college_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-zinc-500">Leader:</span> <span className="text-zinc-200">{selectedTeam.team_leader}</span></div>
              <div><span className="text-zinc-500">Contact:</span> <span className="text-zinc-200">{selectedTeam.contact_number}</span></div>
              <div><span className="text-zinc-500">Status:</span> <Badge className={TEAM_STATUS_COLORS[selectedTeam.status]}>{TEAM_STATUS_LABELS[selectedTeam.status]}</Badge></div>
              <div><span className="text-zinc-500">Score:</span> <span className="text-zinc-200 font-bold">{selectedTeam.total_score}</span></div>
              <div><span className="text-zinc-500">Rank:</span> <span className="text-zinc-200">{selectedTeam.rank || 'N/A'}</span></div>
              <div><span className="text-zinc-500">Registered:</span> <span className="text-zinc-200">{formatDate(selectedTeam.created_at)}</span></div>
            </div>
            {selectedTeam.team_members.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-300 mb-2">Members</h4>
                <div className="space-y-1">
                  {selectedTeam.team_members.map((m, i) => (
                    <p key={i} className="text-sm text-zinc-400">{m.name || `Member ${i + 1}`}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
