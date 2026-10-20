import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_PHOTOS = 5;
type ProofInput = { capturedAt?: unknown; latitude?: unknown; longitude?: unknown; accuracy?: unknown; installationType?: unknown; storeName?: unknown; city?: unknown };

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Stockage photo non configuré : connectez Vercel Blob au projet.' }, { status: 503 });
  const { id } = await ctx.params;
  const installation = await prisma.installation.findUnique({
    where: { id },
    select: { id: true, providerId: true, photos: true, photoProofs: true, installationType: true, storeName: true, city: true }
  });
  if (!installation || (session.role !== 'ADMIN' && installation.providerId !== session.id)) {
    return NextResponse.json({ error: 'Magasin introuvable ou non affecté à votre compte.' }, { status: 404 });
  }
  try {
    const form = await req.formData();
    const files = form.getAll('photos').filter((x): x is File => x instanceof File && x.size > 0);
    const proofRaw = form.get('proofs');
    let proofs: ProofInput[] = [];
    try { proofs = typeof proofRaw === 'string' ? JSON.parse(proofRaw) : []; } catch { proofs = []; }
    if (!files.length) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });
    if (installation.photos.length + files.length > MAX_PHOTOS) return NextResponse.json({ error: `Maximum 5 photos par magasin. Il en reste ${MAX_PHOTOS-installation.photos.length}.` }, { status: 400 });
    if (proofs.length !== files.length) return NextResponse.json({ error: 'Les métadonnées GPS/heure sont manquantes pour une ou plusieurs photos. Utilisez la capture guidée.' }, { status: 400 });
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const proof = proofs[i];
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return NextResponse.json({ error: 'Format non accepté. Utilisez JPG, PNG ou WebP.' }, { status: 400 });
      if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Chaque photo doit faire 10 Mo maximum.' }, { status: 400 });
      if (!proof || typeof proof.capturedAt !== 'string' || !Number.isFinite(Date.parse(proof.capturedAt)) ||
          typeof proof.latitude !== 'number' || proof.latitude < -90 || proof.latitude > 90 ||
          typeof proof.longitude !== 'number' || proof.longitude < -180 || proof.longitude > 180 ||
          typeof proof.accuracy !== 'number' || !Number.isFinite(proof.accuracy) || proof.accuracy < 0) {
        return NextResponse.json({ error: 'Coordonnées GPS ou heure de capture invalides.' }, { status: 400 });
      }
    }

    const oldProofs = Array.isArray(installation.photoProofs) ? installation.photoProofs as Array<Record<string, unknown>> : [];
    const newProofs: Array<Record<string, unknown>> = [];
    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]; const proof = proofs[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'photo.jpg';
      const result = await put(`kroon-installations/${id}/${crypto.randomUUID()}-${safeName}`, file, {
        access: 'public', contentType: file.type, addRandomSuffix: false, token: process.env.BLOB_READ_WRITE_TOKEN
      });
      urls.push(result.url);
      newProofs.push({
        url: result.url,
        capturedAt: new Date(String(proof.capturedAt)).toISOString(),
        receivedAt: new Date().toISOString(),
        latitude: proof.latitude,
        longitude: proof.longitude,
        accuracy: proof.accuracy,
        installationType: installation.installationType,
        storeName: installation.storeName,
        city: installation.city,
        capturedBy: session.id
      });
    }
    const updated = await prisma.installation.update({
      where: { id },
      data: { photos: [...installation.photos, ...urls], photoProofs: [...oldProofs, ...newProofs] },
      select: { photos: true, photoProofs: true }
    });
    return NextResponse.json({ photos: updated.photos, photoProofs: updated.photoProofs });
  } catch (e) {
    console.error('Photo upload failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Échec du téléversement. Vérifiez la configuration de Vercel Blob.' }, { status: 500 });
  }
}
