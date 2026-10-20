import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const allowedStatuses = ['A_REPERER', 'MESURES_PRISES', 'PROD', 'DISPATCH', 'INSTALLE'] as const;
const allowedTypes = ['TG', 'STAND'] as const;
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const body = await req.json();
    const data: { status?: typeof allowedStatuses[number]; providerId?: string | null; installationType?: typeof allowedTypes[number] } = {};
    if (body.status !== undefined) {
      if (!allowedStatuses.includes(body.status)) return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
      data.status = body.status;
    }
    if (body.installationType !== undefined) {
      if (!allowedTypes.includes(body.installationType)) return NextResponse.json({ error: 'Type invalide. Choisissez TG ou STAND.' }, { status: 400 });
      data.installationType = body.installationType;
    }
    if (body.providerId !== undefined) {
      if (body.providerId === null || body.providerId === '') data.providerId = null;
      else {
        const user = await prisma.user.findUnique({ where: { id: String(body.providerId) }, select: { id: true, role: true, active: true } });
        if (!user || user.role !== 'PROVIDER' || !user.active) return NextResponse.json({ error: 'Prestataire invalide ou inactif.' }, { status: 400 });
        data.providerId = user.id;
      }
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Aucune modification fournie.' }, { status: 400 });
    if (data.status === 'INSTALLE') {
      const current = await prisma.installation.findUnique({ where: { id }, select: { measurements: true, photos: true, photoProofs: true } });
      if (!current) return NextResponse.json({ error: 'Installation introuvable.' }, { status: 404 });
      const proofs = Array.isArray(current.photoProofs) ? current.photoProofs : [];
      const verifiedPhotoCount = proofs.filter((x: any) => x && typeof x.url === 'string' && typeof x.capturedAt === 'string' && typeof x.latitude === 'number' && typeof x.longitude === 'number').length;
      if (!current.measurements || verifiedPhotoCount < 3) return NextResponse.json({ error: 'Pour valider, sauvegardez les mesures et ajoutez au moins 3 photos documentées avec GPS.' }, { status: 400 });
    }
    const installation = await prisma.installation.update({ where: { id }, data, include: { provider: { select: { id: true, username: true } } } });
    return NextResponse.json({ installation: { ...installation, deadline: installation.deadline?.toISOString() ?? null, updatedAt: installation.updatedAt.toISOString(), createdAt: installation.createdAt.toISOString(), measurements: installation.measurements as Record<string, unknown> | null } });
  } catch (e) {
    console.error('Admin installation update failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Installation introuvable ou mise à jour impossible.' }, { status: 400 });
  }
}
