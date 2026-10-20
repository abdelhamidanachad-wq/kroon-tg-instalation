import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function validMeasureSet(m: any) {
  const values = [m?.face?.height,m?.face?.width,m?.fronton?.height,m?.fronton?.width,m?.plinthe?.height,m?.plinthe?.width,m?.cotes?.globalHeight,m?.cotes?.topWidth,m?.cotes?.bottomWidth];
  return values.every(v => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 100000) && m?.unit === 'cm';
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  const { id } = await ctx.params;
  const current = await prisma.installation.findUnique({ where: { id } });
  if (!current || (session.role !== 'ADMIN' && current.providerId !== session.id)) return NextResponse.json({ error: 'Magasin introuvable ou non affecté à votre compte.' }, { status: 404 });
  try {
    const body = await req.json();
    const data: { measurements?: object; status?: 'A_REPERER'|'MESURES_PRISES'|'PROD'|'DISPATCH'|'INSTALLE' } = {};
    if (body.measurements !== undefined) {
      if (!validMeasureSet(body.measurements)) return NextResponse.json({ error: 'Les 9 mesures doivent être des nombres positifs et l’unité doit être cm.' }, { status: 400 });
      data.measurements = body.measurements;
      if (current.status === 'A_REPERER') data.status = 'MESURES_PRISES';
    }
    if (body.status !== undefined) {
      if (session.role === 'ADMIN') {
        const allowed = ['A_REPERER','MESURES_PRISES','PROD','DISPATCH','INSTALLE'];
        if (!allowed.includes(body.status)) return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
        if (body.status === 'INSTALLE') {
          const proofs = Array.isArray(current.photoProofs) ? current.photoProofs as Array<Record<string, unknown>> : [];
          const count = proofs.filter(x => typeof x.url === 'string' && typeof x.capturedAt === 'string' && typeof x.latitude === 'number' && typeof x.longitude === 'number').length;
          if ((!current.measurements && !data.measurements) || count < 3) return NextResponse.json({ error: 'Il faut des mesures sauvegardées et au moins 3 photos avec GPS.' }, { status: 400 });
        }
        data.status = body.status;
      } else {
        if (body.status !== 'INSTALLE') return NextResponse.json({ error: 'Seul l’administrateur peut modifier ce statut.' }, { status: 403 });
        const proofs = Array.isArray(current.photoProofs) ? current.photoProofs as Array<Record<string, unknown>> : [];
        const count = proofs.filter(x => typeof x.url === 'string' && typeof x.capturedAt === 'string' && typeof x.latitude === 'number' && typeof x.longitude === 'number').length;
        if (!(current.measurements || data.measurements) || count < 3) return NextResponse.json({ error: 'Il faut des mesures sauvegardées et au moins 3 photos avec GPS.' }, { status: 400 });
        data.status = 'INSTALLE';
      }
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Aucune modification valide.' }, { status: 400 });
    const installation = await prisma.installation.update({ where: { id }, data });
    return NextResponse.json({ installation: { id: installation.id, status: installation.status, measurements: installation.measurements } });
  } catch (e) {
    console.error('Save installation failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Impossible de sauvegarder cette fiche.' }, { status: 500 });
  }
}
