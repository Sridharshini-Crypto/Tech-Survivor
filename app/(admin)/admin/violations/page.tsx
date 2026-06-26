'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/skeleton';
import { VIOLATION_TYPE_LABELS } from '@/constants';
import { formatRelativeTime, generateAvatar } from '@/lib/utils';
import { useRealtimeSubscription } from '@/hooks/use-realtime';
import type { Violation } from '@/types';

const actionOptions = [
  { value: 'allow_continue', label: 'Allow', color: 'secondary' as const },
  { value: 'warn', label: 'Warn', color: 'secondary' as const },
  { value: 'lock', label: 'Lock', color: 'danger' as const },
  { value: 'suspend', label: 'Suspend', color: 'danger' as const },
  { value: 'disqualify', label: 'Disqualify', color: 'danger' as const },
];

export default function ViolationsPage() {
  const queryClient = useQueryClient();

  const { data: violations = [], isLoading } = useQuery<Violation[]>({
    queryKey: ['violations'],
    queryFn: () => fetch('/api/violations').then((r) => r.json()),
    refetchInterval: 5000,
  });

  const realtimeCallback = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['violations'] });
  }, [queryClient]);
  useRealtimeSubscription('violations', realtimeCallback);

  const handleAction = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/violations', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['violations'] }); toast.success('Action taken'); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Violation Monitor</h1>
        <p className="text-sm text-zinc-500">{violations.length} violations recorded</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Real-Time Violations</h2>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton /> : violations.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-zinc-400">No violations detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {violations.map((v) => (
                <div key={v.id} className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={v.team?.avatar_url || generateAvatar(v.team?.team_name || 'Team')} alt="" className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">{v.team?.team_name || 'Unknown Team'}</p>
                      <p className="text-xs text-zinc-500">{formatRelativeTime(v.created_at)}</p>
                    </div>
                    <Badge variant="danger">{VIOLATION_TYPE_LABELS[v.violation_type] || v.violation_type}</Badge>
                  </div>
                  {v.description && <p className="text-xs text-zinc-400">{v.description}</p>}
                  {v.action_taken === 'allow_continue' && (
                    <div className="flex gap-2">
                      {actionOptions.map((opt) => (
                        <Button
                          key={opt.value}
                          size="sm"
                          variant={opt.color}
                          onClick={() => handleAction.mutate({ id: v.id, team_id: v.team_id, action_taken: opt.value })}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  )}
                  {v.action_taken !== 'allow_continue' && (
                    <Badge variant="warning">Action: {v.action_taken}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
