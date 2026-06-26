'use client';

import { Sidebar } from '@/components/shared/sidebar';
import { NAV_ITEMS } from '@/constants';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={NAV_ITEMS.team as unknown as { label: string; href: string; icon: string }[]} type="team" />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
