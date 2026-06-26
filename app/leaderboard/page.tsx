'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import { generateAvatar } from '@/lib/utils';
import { PRESENCE_COLORS } from '@/constants';

interface LeaderboardEntry {
  id: string;
  rank: number;
  team_name: string;
  avatar_url?: string;
  total_score: number;
  status: string;
  college_name: string;
  presence: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: () => fetch('/api/leaderboard').then((r) => r.json()),
    refetchInterval: 5000,
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
  }, [queryClient]);
  useRealtimeSubscription('teams', realtimeCallback);

  const rankStyles = [
    'bg-gradient-to-r from-yellow-500/20 to-yellow-600/5 border-yellow-500/30',
    'bg-gradient-to-r from-zinc-400/20 to-zinc-500/5 border-zinc-400/30',
    'bg-gradient-to-r from-orange-600/20 to-orange-700/5 border-orange-600/30',
  ];

  return (
    <div className="min-h-screen bg-[#09090B] py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-zinc-500 hover:text-zinc-300"
            >
              <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-400" /> Leaderboard
            </h1>
            <p className="text-sm text-zinc-500">Live rankings updated in real-time</p>
          </div>
        
          <div>
            <h1 className="text-3xl font-bold text-zinc-100 flex items-center gap-2">
              <Trophy className="h-8 w-8 text-yellow-400" /> Leaderboard
            </h1>
            <p className="text-sm text-zinc-500">Live rankings updated in real-time</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Rankings</h2>
              <Badge>{teams.length} teams</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <TableSkeleton rows={10} /> : teams.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">No teams on the leaderboard yet</p>
            ) : (
              <div className="space-y-2">
                {teams.map((team, i) => (
                  <motion.div
                    key={team.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                      i < 3 ? rankStyles[i] : 'border-zinc-800 bg-zinc-900/30'
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-black ${
                      i === 0 ? 'bg-yellow-500/30 text-yellow-400' :
                      i === 1 ? 'bg-zinc-400/30 text-zinc-300' :
                      i === 2 ? 'bg-orange-500/30 text-orange-400' :
                      'bg-zinc-800 text-zinc-500'
                    }`}>
                      {team.rank}
                    </span>

                    <div className="relative">
                      <img src={team.avatar_url || generateAvatar(team.team_name)} alt="" className="w-10 h-10 rounded-full" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${PRESENCE_COLORS[team.presence] || 'bg-zinc-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-200 truncate">{team.team_name}</p>
                      <p className="text-xs text-zinc-500">{team.college_name}</p>
                    </div>

                    <span className="text-lg font-bold text-red-400">{team.total_score}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
