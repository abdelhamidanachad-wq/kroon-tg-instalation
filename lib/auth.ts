import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { redirect } from 'next/navigation';

const COOKIE = 'tg_session';
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('SESSION_SECRET must contain at least 32 characters');
  return new TextEncoder().encode(value);
}

export type SessionUser = { id: string; username: string; role: 'ADMIN' | 'PROVIDER' };
export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(user.id).setIssuedAt()
    .setExpirationTime('12h').sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
}
export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || (payload.role !== 'ADMIN' && payload.role !== 'PROVIDER') || typeof payload.username !== 'string') return null;
    return { id: payload.sub, username: payload.username, role: payload.role };
  } catch { return null; }
}
export async function requireUser() {
  const user = await getSession();
  if (!user) redirect('/login');
  return user;
}
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'ADMIN') redirect('/stores');
  return user;
}
