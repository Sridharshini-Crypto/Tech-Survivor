import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const ADMIN_SESSION_COOKIE = 'ts_admin_session';
const TEAM_SESSION_COOKIE = 'ts_team_session';

export interface SessionData {
  id: string;
  type: 'admin' | 'team';
  entityId: string;
  expiresAt: number;
}

function encodeSession(data: SessionData): string {
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

function decodeSession(token: string): SessionData | null {
  try {
    const data = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (data.expiresAt < Date.now()) return null;
    return data as SessionData;
  } catch {
    return null;
  }
}

export async function createAdminSession(adminId: string): Promise<string> {
  const sessionId = uuidv4();
  const session: SessionData = {
    id: sessionId,
    type: 'admin',
    entityId: adminId,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  const token = encodeSession(session);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60,
    path: '/',
  });
  return sessionId;
}

export async function createTeamSession(teamId: string): Promise<string> {
  const sessionId = uuidv4();
  const session: SessionData = {
    id: sessionId,
    type: 'team',
    entityId: teamId,
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  };
  const token = encodeSession(session);
  const cookieStore = await cookies();
  cookieStore.set(TEAM_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  });
  return sessionId;
}

export async function getAdminSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = decodeSession(token);
  if (!session || session.type !== 'admin') return null;
  return session;
}

export async function getTeamSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = decodeSession(token);
  if (!session || session.type !== 'team') return null;
  return session;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function clearTeamSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TEAM_SESSION_COOKIE);
}
