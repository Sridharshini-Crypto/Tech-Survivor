'use client';

import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
import type { AuditLogEntry } from '@/types';

const actionColors: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  create: 'success', update: 'info', delete: 'danger', approve: 'success', reject: 'danger',
  login: 'info', logout: 'default', start_round: 'success', end_round: 'warning',
  submit_answer: 'info', grade_answer: 'success', violation: 'danger',
  score_change: 'warning', team_status_change: 'warning', settings_change: 'info', announcement: 'info',
};

export default function AuditLogPage() {
  const { data: logs = [], isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['audit-log'],
    queryFn: () => fetch('/api/audit-log?limit=200').then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Audit Log</h1>
        <p className="text-sm text-zinc-500">Complete activity trail</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><FileText className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-zinc-100">Activity Log</h2></div>
        </CardHeader>
        <CardContent>
          {isLoading ? <TableSkeleton rows={10} /> : logs.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No activity recorded</p>
          ) : (
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30">
                  <Badge variant={actionColors[log.action] || 'default'}>{log.action}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300">
                      <span className="text-zinc-500">{log.actor_type}:</span>{' '}
                      {log.action} {log.entity_type}
                    </p>
                    {log.details && Object.keys(log.details).length > 0 && (
                      <p className="text-xs text-zinc-500 truncate">{JSON.stringify(log.details)}</p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600 whitespace-nowrap">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
