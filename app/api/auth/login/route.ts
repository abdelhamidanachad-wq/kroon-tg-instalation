import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    if (!username || !password || username.length > 100 || password.length > 200) return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.active || !(await bcrypt.compare(password, user.passwordHash))) return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
    await createSession({ id: user.id, username: user.username, role: user.role });
    return NextResponse.json({ redirectTo: user.role === 'ADMIN' ? '/admin' : '/stores' });
  } catch (error) {
    console.error('Login failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Service indisponible. Vérifiez la configuration serveur.' }, { status: 500 });
  }
}
