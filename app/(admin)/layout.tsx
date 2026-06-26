'use client';

import { Sidebar } from '@/components/shared/sidebar';
import { NAV_ITEMS } from '@/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={NAV_ITEMS.admin as unknown as { label: string; href: string; icon: string }[]} type="admin" />
      <main className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
