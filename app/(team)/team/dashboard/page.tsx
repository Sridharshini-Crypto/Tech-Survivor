'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trophy, Target, Hash, Layers, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CardSkeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';
import { useTeamAuth } from '@/hooks/use-auth';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import { generateAvatar } from '@/lib/utils';
import { ROUND_STATUS_LABELS, ROUND_STATUS_COLORS } from '@/constants';
import type { Round, Announcement } from '@/types';

export default function TeamDashboardPage() {
  const { team } = useTeamAuth();
  const queryClient = useQueryClient();

  const { data: rounds = [] } = useQuery<Round[]>({
    queryKey: ['rounds'],
    queryFn: () => fetch('/api/rounds').then((r) => r.json()),
  });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => fetch('/api/announcements').then((r) => r.json()),
  });

  const { data: leaderboard = [] } = useQuery<{ id: string; rank: number; team_name: string; total_score: number }[]>({
    queryKey: ['leaderboard'],
    queryFn: () => fetch('/api/leaderboard').then((r) => r.json()),
    refetchInterval: 10000,
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['rounds'] });
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    queryClient.invalidateQueries({ queryKey: ['announcements'] });
  }, [queryClient]);
  useRealtimeSubscription('rounds', realtimeCallback);
  useRealtimeSubscription('announcements', realtimeCallback);

  const activeRound = rounds.find((r) => r.status === 'active');
  const myRank = leaderboard.find((t) => t.id === team?.id);

  if (!team) return <CardSkeleton />;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center gap-4">
          <img src={team.avatar_url || generateAvatar(team.team_name)} alt="" className="w-16 h-16 rounded-full border-2 border-red-500/30" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">{team.team_name}</h1>
            <p className="text-sm text-zinc-500">{team.college_name} &middot; {team.team_leader}</p>
          </div>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Trophy className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-xs text-zinc-500">Current Score</p>
                <p className="text-2xl font-bold text-zinc-100">{team.total_score}</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Hash className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-xs text-zinc-500">Current Rank</p>
                <p className="text-2xl font-bold text-zinc-100">{myRank?.rank || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Layers className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-xs text-zinc-500">Active Round</p>
                <p className="text-lg font-bold text-zinc-100">{activeRound?.name || 'None'}</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardContent className="flex items-center gap-4 py-5">
              <Users className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-xs text-zinc-500">Team Members</p>
                <p className="text-2xl font-bold text-zinc-100">{team.team_members?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {activeRound && (
        <FadeIn delay={0.2}>
          <Card glow>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-100">Active Round: {activeRound.name}</h2>
                <Badge className={ROUND_STATUS_COLORS[activeRound.status]}>{ROUND_STATUS_LABELS[activeRound.status]}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <Clock className="h-4 w-4" />
                <span>Timer: {activeRound.timer_duration}s per question</span>
              </div>
              <a href="/team/competition" className="mt-4 inline-block px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                Enter Competition
              </a>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {announcements.length > 0 && (
        <FadeIn delay={0.4}>
          <Card>
            <CardHeader><h2 className="text-lg font-semibold text-zinc-100">Announcements</h2></CardHeader>
            <CardContent className="space-y-3">
              {announcements.slice(0, 5).map((a) => (
                <div key={a.id} className={`p-3 rounded-lg border ${a.is_urgent ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
                  <p className="text-sm font-medium text-zinc-200">{a.title}</p>
                  <p className="text-xs text-zinc-400 mt-1">{a.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
