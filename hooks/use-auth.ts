'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin, Team } from '@/types';

interface AdminAuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  setAdmin: (admin: Admin | null) => void;
  logout: () => void;
}

interface TeamAuthState {
  team: Team | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  setTeam: (team: Team | null) => void;
  setSessionId: (id: string | null) => void;
  logout: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: !!admin }),
      logout: () => set({ admin: null, isAuthenticated: false }),
    }),
    { name: 'ts-admin-auth' }
  )
);

export const useTeamAuth = create<TeamAuthState>()(
  persist(
    (set) => ({
      team: null,
      isAuthenticated: false,
      sessionId: null,
      setTeam: (team) => set({ team, isAuthenticated: !!team }),
      setSessionId: (sessionId) => set({ sessionId }),
      logout: () => set({ team: null, isAuthenticated: false, sessionId: null }),
    }),
    { name: 'ts-team-auth' }
  )
);
