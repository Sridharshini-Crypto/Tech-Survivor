'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Wifi, AlertTriangle, FileText, BarChart3, Trophy, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/animations/fade-in';

interface AnalyticsData {
  totalTeams: number;
  approvedTeams: number;
  pendingTeams: number;
  onlineTeams: number;
  totalViolations: number;
  totalSubmissions: number;
  accuracyRate: number;
  avgScore: number;
  topTeams: { team_name: string; total_score: number }[];
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="text-2xl font-bold text-zinc-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: () => fetch('/api/analytics').then((r) => r.json()),
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500">Event overview and real-time statistics</p>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StaggerItem>
          <StatCard icon={Users} label="Total Teams" value={data?.totalTeams ?? 0} color="bg-blue-500/10 text-blue-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={UserCheck} label="Approved Teams" value={data?.approvedTeams ?? 0} color="bg-green-500/10 text-green-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Wifi} label="Online Teams" value={data?.onlineTeams ?? 0} color="bg-emerald-500/10 text-emerald-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={AlertTriangle} label="Violations" value={data?.totalViolations ?? 0} color="bg-red-500/10 text-red-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={FileText} label="Submissions" value={data?.totalSubmissions ?? 0} color="bg-purple-500/10 text-purple-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={BarChart3} label="Accuracy Rate" value={`${data?.accuracyRate ?? 0}%`} color="bg-yellow-500/10 text-yellow-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Trophy} label="Avg Score" value={data?.avgScore ?? 0} color="bg-orange-500/10 text-orange-400" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Activity} label="Pending Teams" value={data?.pendingTeams ?? 0} color="bg-amber-500/10 text-amber-400" />
        </StaggerItem>
      </StaggerContainer>

      <FadeIn delay={0.3}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-zinc-100">Top Performing Teams</h2>
          </CardHeader>
          <CardContent>
            {data?.topTeams && data.topTeams.length > 0 ? (
              <div className="space-y-3">
                {data.topTeams.map((team, i) => (
                  <div key={team.team_name} className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-zinc-200">{team.team_name}</span>
                    <span className="text-sm font-semibold text-red-400">{team.total_score} pts</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">No teams yet</p>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
