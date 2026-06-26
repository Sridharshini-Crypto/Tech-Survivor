'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CardSkeleton } from '@/components/ui/skeleton';
import type { EventSettings } from '@/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<EventSettings>>({});

  const { data: settings, isLoading } = useQuery<EventSettings>({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((r) => r.json()),
  });

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  const save = useMutation({
    mutationFn: (data: Partial<EventSettings>) =>
      fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then((r) => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); },
  });

  const toggle = (key: keyof EventSettings) => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (isLoading) return <div className="space-y-4"><CardSkeleton /><CardSkeleton /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Event Settings</h1>
          <p className="text-sm text-zinc-500">Configure event parameters</p>
        </div>
        <Button onClick={() => save.mutate(form)} loading={save.isPending}>
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader><h2 className="font-semibold text-zinc-100">General</h2></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Event Name" value={form.event_name || ''} onChange={(e) => setForm({ ...form, event_name: e.target.value })} />
            <Input label="Presented By" value={form.presented_by || ''} onChange={(e) => setForm({ ...form, presented_by: e.target.value })} />
            <Input label="Primary Color" type="color" value={form.primary_color || '#DC2626'} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} />
            <Input label="Accent Color" type="color" value={form.accent_color || '#EF4444'} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-zinc-100">Competition</h2></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Marks Per Question" type="number" value={form.marks_per_question || 10} onChange={(e) => setForm({ ...form, marks_per_question: Number(e.target.value) })} />
            <Input label="Default Timer (seconds)" type="number" value={form.default_timer || 60} onChange={(e) => setForm({ ...form, default_timer: Number(e.target.value) })} />
            <Input label="Max Team Size" type="number" value={form.max_team_size || 5} onChange={(e) => setForm({ ...form, max_team_size: Number(e.target.value) })} />
            <Input label="Max Admins" type="number" value={form.max_admins || 5} onChange={(e) => setForm({ ...form, max_admins: Number(e.target.value) })} />
            <Input label="Negative Marks" type="number" value={form.negative_marks || 0} onChange={(e) => setForm({ ...form, negative_marks: Number(e.target.value) })} />
            <Input label="Max Violations Before Lock" type="number" value={form.max_violations_before_lock || 3} onChange={(e) => setForm({ ...form, max_violations_before_lock: Number(e.target.value) })} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold text-zinc-100">Feature Toggles</h2></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: 'enable_registration' as const, label: 'Team Registration' },
                { key: 'enable_realtime' as const, label: 'Real-Time Updates' },
                { key: 'enable_notifications' as const, label: 'Notifications' },
                { key: 'enable_monitoring' as const, label: 'Security Monitoring' },
                { key: 'enable_fullscreen' as const, label: 'Fullscreen Enforcement' },
                { key: 'enable_multi_tab_detection' as const, label: 'Multi-Tab Detection' },
                { key: 'enable_tab_switch_detection' as const, label: 'Tab Switch Detection' },
                { key: 'enable_sound_effects' as const, label: 'Sound Effects' },
                { key: 'negative_marking' as const, label: 'Negative Marking' },
                { key: 'auto_lock_on_violation' as const, label: 'Auto Lock on Violation' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => toggle(key)} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 hover:bg-zinc-800/50">
                  <span className="text-sm text-zinc-300">{label}</span>
                  <div className={`w-10 h-6 rounded-full transition-colors ${form[key] ? 'bg-red-500' : 'bg-zinc-700'} relative`}>
                    <div className={`absolute w-4 h-4 bg-white rounded-full top-1 transition-all ${form[key] ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
