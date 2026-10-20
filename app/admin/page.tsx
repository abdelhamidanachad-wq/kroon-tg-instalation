import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminClient from './admin-client';

export default async function AdminPage() {
  await requireAdmin();
  const [installations, users] = await Promise.all([
    prisma.installation.findMany({ include: { provider: { select: { id: true, username: true } } }, orderBy: [{ city: 'asc' }, { storeName: 'asc' }] }),
    prisma.user.findMany({ where: { role: 'PROVIDER' }, select: { id: true, username: true, phone: true, active: true, createdAt: true }, orderBy: { username: 'asc' } })
  ]);
  const rows = installations.map(x => ({
    ...x,
    deadline: x.deadline?.toISOString() ?? null,
    updatedAt: x.updatedAt.toISOString(),
    createdAt: x.createdAt.toISOString(),
    measurements: x.measurements as Record<string, unknown> | null,
    photoProofs: (Array.isArray(x.photoProofs) ? x.photoProofs : []) as Array<{url:string;capturedAt:string;receivedAt:string;latitude:number;longitude:number;accuracy:number;installationType:string;storeName:string;city:string}>
  }));
  return <AdminClient initialInstallations={rows} initialUsers={users.map(u=>({...u,createdAt:u.createdAt.toISOString()}))} />;
}
