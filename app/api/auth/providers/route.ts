import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const providers = await prisma.user.findMany({
      where: { role: 'PROVIDER', active: true },
      select: { username: true },
      orderBy: { username: 'asc' },
    });
    return NextResponse.json({
      providers: providers.map((provider) => ({
        username: provider.username,
        label: provider.username.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
      })),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Provider login list failed:', error instanceof Error ? error.message : 'unknown');
    return NextResponse.json({ error: 'Service indisponible. Réessayez dans un instant.' }, { status: 500 });
  }
}
