'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Zap, LogOut, Menu, X } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items: readonly NavItem[] | NavItem[];
  type: 'admin' | 'team';
}

export function Sidebar({ items, type }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (type === 'admin') {
        localStorage.removeItem('ts-admin-auth');
      } else {
        localStorage.removeItem('ts-team-auth');
      }
      router.push('/');
      toast.success('Logged out successfully');
    } catch {
      toast.error('Logout failed');
    }
  };

  const NavContent = () => (
    <>
      <div className="p-4 border-b border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-red-500" />
          <div>
            <span className="font-bold text-sm text-zinc-100">TECH SURVIVOR</span>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {type === 'admin' ? 'Admin Panel' : 'Team Portal'}
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon] || Icons.Circle;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                isActive
                  ? 'bg-red-500/10 text-red-400 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              )}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 lg:hidden"
      >
        <Menu className="h-5 w-5 text-zinc-300" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative w-64 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-zinc-500"
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex w-64 flex-shrink-0 h-screen flex-col bg-zinc-900/50 border-r border-zinc-800 sticky top-0">
        <NavContent />
      </aside>
    </>
  );
}
