import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'PROVIDER') return NextResponse.json({ error: 'Équipe introuvable.' }, { status: 404 });
  const data: { passwordHash?: string; phone?: string | null; active?: boolean } = {};
  if (body.password !== undefined) {
    const password = typeof body.password === 'string' ? body.password : '';
    if (!/^\d{4,12}$/.test(password)) return NextResponse.json({ error: 'Le PIN doit contenir 4 à 12 chiffres.' }, { status: 400 });
    data.passwordHash = await bcrypt.hash(password, 12);
  }
  if (body.phone !== undefined) {
    if (typeof body.phone !== 'string') return NextResponse.json({ error: 'Téléphone invalide.' }, { status: 400 });
    data.phone = body.phone.trim().slice(0, 40) || null;
  }
  if (body.active !== undefined) {
    if (typeof body.active !== 'boolean') return NextResponse.json({ error: 'État de compte invalide.' }, { status: 400 });
    data.active = body.active;
  }
  if (!Object.keys(data).length) return NextResponse.json({ error: 'Aucune modification fournie.' }, { status: 400 });
  const user = await prisma.user.update({ where: { id }, data, select: { id: true, username: true, phone: true, active: true } });
  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.role !== 'PROVIDER') return NextResponse.json({ error: 'Équipe introuvable.' }, { status: 404 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
