import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Session expirée.' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Stockage photo non configuré : connectez Vercel Blob au projet.' }, { status: 503 });
  const { id } = await ctx.params;
  const installation = await prisma.installation.findUnique({ where: { id }, select: { id: true, providerId: true, photos: true } });
  if (!installation || (session.role !== 'ADMIN' && installation.providerId !== session.id)) return NextResponse.json({ error: 'Magasin introuvable ou non affecté à votre compte.' }, { status: 404 });
  try {
    const form = await req.formData();
    const files = form.getAll('photos').filter((x): x is File => x instanceof File && x.size > 0);
    if (!files.length) return NextResponse.json({ error: 'Aucune photo reçue.' }, { status: 400 });
    if (installation.photos.length + files.length > 5) return NextResponse.json({ error: `Maximum 5 photos par magasin. Il en reste ${5-installation.photos.length}.` }, { status: 400 });
    for (const file of files) {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return NextResponse.json({ error: 'Format non accepté. Utilisez JPG, PNG ou WebP.' }, { status: 400 });
      if (file.size > MAX_PHOTO_BYTES) return NextResponse.json({ error: 'Chaque photo doit faire 10 Mo maximum.' }, { status: 400 });
    }
    const urls: string[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'photo.jpg';
      const result = await put(`tg-installations/${id}/${crypto.randomUUID()}-${safeName}`, file, { access: 'public', contentType: file.type, addRandomSuffix: false, token: process.env.BLOB_READ_WRITE_TOKEN });
      urls.push(result.url);
    }
    const updated = await prisma.installation.update({ where: { id }, data: { photos: [...installation.photos, ...urls] }, select: { photos: true } });
    return NextResponse.json({ photos: updated.photos });
  } catch (e) {
    console.error('Photo upload failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Échec du téléversement. Vérifiez la configuration de Vercel Blob.' }, { status: 500 });
  }
}
