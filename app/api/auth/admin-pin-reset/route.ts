import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * One-time bootstrap/reset endpoint.
 * Set ADMIN_PIN_RESET_TOKEN to a long random secret in Vercel before use.
 * This endpoint never returns or stores the PIN in plain text.
 */
export async function POST(req: Request) {
  const expectedToken = process.env.ADMIN_PIN_RESET_TOKEN;
  if (!expectedToken || expectedToken.length < 32) {
    return NextResponse.json({ error: 'Reset endpoint not configured.' }, { status: 503 });
  }
  const suppliedToken = req.headers.get('x-admin-reset-token') || '';
  if (suppliedToken.length !== expectedToken.length ||
      !Buffer.from(suppliedToken).equals(Buffer.from(expectedToken))) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';
    if (!/^\d{4,12}$/.test(pin)) {
      return NextResponse.json({ error: 'Le PIN doit contenir 4 à 12 chiffres.' }, { status: 400 });
    }
    const passwordHash = await bcrypt.hash(pin, 12);
    const user = await prisma.user.upsert({
      where: { username: 'admin' },
      update: { passwordHash, role: 'ADMIN', active: true },
      create: { username: 'admin', passwordHash, role: 'ADMIN', active: true },
      select: { id: true, username: true, role: true, active: true }
    });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error('Admin PIN reset failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Reset impossible. Vérifiez la base de données.' }, { status: 500 });
  }
}
