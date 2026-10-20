import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  try {
    const body = await req.json();
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : '';
    if (!/^[a-z0-9_-]{3,50}$/.test(username)) return NextResponse.json({ error: 'Identifiant invalide (3–50 caractères : lettres, chiffres, _ ou -).' }, { status: 400 });
    if (!/^\\d{4,12}$/.test(password)) return NextResponse.json({ error: 'Le PIN doit contenir 4 à 12 chiffres.' }, { status: 400 });
    if (await prisma.user.findUnique({ where: { username } })) return NextResponse.json({ error: 'Cet identifiant existe déjà.' }, { status: 409 });
    const user = await prisma.user.create({ data: { username, passwordHash: await bcrypt.hash(password, 12), phone: phone || null, role: 'PROVIDER' }, select: { id: true, username: true, phone: true, active: true, createdAt: true } });
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error('Create provider failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Impossible de créer le compte.' }, { status: 500 });
  }
}
