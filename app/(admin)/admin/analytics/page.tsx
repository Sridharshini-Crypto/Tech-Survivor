'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, Users, Target, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery<{
    totalTeams: number; approvedTeams: number; onlineTeams: number;
    totalSubmissions: number; totalViolations: number; accuracyRate: number; avgScore: number;
    topTeams: { team_name: string; total_score: number }[];
  }>({
    queryKey: ['analytics'],
    queryFn: () => fetch('/api/analytics').then((r) => r.json()),
  });

  if (isLoading) return <div className="grid grid-cols-2 gap-4">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analytics</h1>
        <p className="text-sm text-zinc-500">Competition statistics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Teams', value: data?.totalTeams, color: 'text-blue-400' },
          { icon: Target, label: 'Accuracy Rate', value: `${data?.accuracyRate}%`, color: 'text-green-400' },
          { icon: TrendingUp, label: 'Avg Score', value: data?.avgScore, color: 'text-yellow-400' },
          { icon: BarChart3, label: 'Total Submissions', value: data?.totalSubmissions, color: 'text-purple-400' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 py-5">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-xs text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-100">{stat.value ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-zinc-100">Team Performance Rankings</h2></CardHeader>
        <CardContent>
          {data?.topTeams?.length ? (
            <div className="space-y-3">
              {data.topTeams.map((team, i) => (
                <div key={team.team_name} className="flex items-center gap-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                    i === 1 ? 'bg-zinc-400/20 text-zinc-300' :
                    i === 2 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-200">{team.team_name}</span>
                      <span className="text-sm font-bold text-red-400">{team.total_score} pts</span>
                    </div>
                    <div className="mt-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full"
                        style={{ width: `${data.topTeams[0].total_score ? (team.total_score / data.topTeams[0].total_score) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-zinc-500 text-center py-8">No data available</p>}
        </CardContent>
      </Card>
    </div>
  );
}
