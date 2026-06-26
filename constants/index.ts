export const BRAND = {
  name: 'TECH SURVIVOR',
  presentedBy: 'TEAM ASYMMETRIC PRESENTS',
  tagline: 'Survive. Compete. Conquer.',
} as const;

export const COLORS = {
  primaryRed: '#DC2626',
  darkRed: '#991B1B',
  crimson: '#B91C1C',
  accentRed: '#EF4444',
  black: '#09090B',
  darkGray: '#18181B',
  zincGray: '#27272A',
  white: '#FAFAFA',
} as const;

export const TEAM_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  disabled: 'Disabled',
  suspended: 'Suspended',
  eliminated: 'Eliminated',
};

export const TEAM_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-500/20 text-green-400 border-green-500/30',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  disabled: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  suspended: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  eliminated: 'bg-red-900/20 text-red-600 border-red-900/30',
};

export const ROUND_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  ended: 'Ended',
  archived: 'Archived',
};

export const ROUND_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-zinc-500/20 text-zinc-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  ended: 'bg-red-500/20 text-red-400',
  archived: 'bg-zinc-800/20 text-zinc-500',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  extreme: 'Extreme',
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-orange-500/20 text-orange-400',
  extreme: 'bg-red-500/20 text-red-400',
};

export const PRESENCE_COLORS: Record<string, string> = {
  online: 'bg-green-500',
  idle: 'bg-yellow-500',
  offline: 'bg-zinc-500',
};

export const VIOLATION_TYPE_LABELS: Record<string, string> = {
  fullscreen_exit: 'Fullscreen Exit',
  tab_switch: 'Tab Switch',
  multi_tab: 'Multiple Tabs',
  focus_loss: 'Focus Loss',
  browser_minimize: 'Browser Minimized',
  window_change: 'Window Change',
  copy_paste: 'Copy/Paste',
  other: 'Other',
};

export const NAV_ITEMS = {
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Teams', href: '/admin/teams', icon: 'Users' },
    { label: 'Rounds', href: '/admin/rounds', icon: 'Layers' },
    { label: 'Questions', href: '/admin/questions', icon: 'HelpCircle' },
    { label: 'Control Center', href: '/admin/control-center', icon: 'Settings2' },
    { label: 'Violations', href: '/admin/violations', icon: 'AlertTriangle' },
    { label: 'Announcements', href: '/admin/announcements', icon: 'Megaphone' },
    { label: 'Review', href: '/admin/review', icon: 'CheckSquare' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart3' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
    { label: 'Audit Log', href: '/admin/audit-log', icon: 'FileText' },
  ],
  team: [
    { label: 'Dashboard', href: '/team/dashboard', icon: 'LayoutDashboard' },
    { label: 'Competition', href: '/team/competition', icon: 'Swords' },
    { label: 'History', href: '/team/history', icon: 'History' },
    { label: 'Leaderboard', href: '/leaderboard', icon: 'Trophy' },
  ],
} as const;
