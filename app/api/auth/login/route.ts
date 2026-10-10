import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const role = body.role === 'PROVIDER' ? 'PROVIDER' : 'ADMIN';
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : 'admin';
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!/^\d{4,12}$/.test(pin)) {
      return NextResponse.json({ error: 'Entrez un PIN de 4 à 12 chiffres.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.active || user.role !== role || !(await bcrypt.compare(pin, user.passwordHash))) {
      return NextResponse.json({ error: 'PIN incorrect ou accès non autorisé.' }, { status: 401 });
    }

    await createSession({ id: user.id, username: user.username, role: user.role });
    return NextResponse.json({ redirectTo: user.role === 'ADMIN' ? '/admin' : '/stores' });
  } catch (error) {
    console.error('Login failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Service indisponible. Vérifiez la configuration serveur.' }, { status: 500 });
  }
}
