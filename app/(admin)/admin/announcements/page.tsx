'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Megaphone, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatRelativeTime } from '@/lib/utils';
import type { Announcement } from '@/types';

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', target: 'global', is_urgent: false });

  const { data: announcements = [] } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: () => fetch('/api/announcements').then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/announcements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['announcements'] }); setShowCreate(false); toast.success('Announcement sent'); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Announcements</h1>
          <p className="text-sm text-zinc-500">Send announcements to teams</p>
        </div>
        <Button onClick={() => { setForm({ title: '', message: '', target: 'global', is_urgent: false }); setShowCreate(true); }}>
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-red-400" /><h2 className="text-lg font-semibold text-zinc-100">History</h2></div>
        </CardHeader>
        <CardContent>
          {announcements.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className={`p-4 rounded-lg border ${a.is_urgent ? 'border-red-500/50 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {a.is_urgent && <AlertCircle className="h-4 w-4 text-red-400" />}
                    <h3 className="text-sm font-medium text-zinc-200">{a.title}</h3>
                    <Badge>{a.target}</Badge>
                    <span className="text-xs text-zinc-500 ml-auto">{formatRelativeTime(a.created_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-400">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Announcement">
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} required />
          <Select label="Target" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}
            options={[{ value: 'global', label: 'Global' }, { value: 'team', label: 'Team' }, { value: 'round', label: 'Round' }]} />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form.is_urgent} onChange={(e) => setForm({ ...form, is_urgent: e.target.checked })} className="rounded border-zinc-700" />
            Mark as Urgent
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={create.isPending}>Send</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
