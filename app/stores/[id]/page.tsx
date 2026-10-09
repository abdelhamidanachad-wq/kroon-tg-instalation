import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StoreClient from './store-client';
import LogoutButton from '../logout-button';
import { ArrowLeft, FileText, MapPin } from 'lucide-react';

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession(); if (!user) redirect('/login');
  const { id } = await params;
  const installation = await prisma.installation.findUnique({ where: { id }, include: { provider: { select: { id: true, username: true } } } });
  if (!installation || (user.role !== 'ADMIN' && installation.providerId !== user.id)) notFound();
  return <main className="min-h-screen"><header className="bg-[#13223a] text-white"><div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between"><div><div className="font-extrabold tracking-wide">TG INSTALLATIONS <span className="text-red-300">MAROC</span></div><div className="text-xs text-white/65 mt-1">Fiche magasin</div></div><LogoutButton/></div></header><div className="max-w-4xl mx-auto p-4 md:p-7"><Link href={user.role==='ADMIN'?'/admin':'/stores'} className="inline-flex items-center gap-2 muted text-sm mb-5"><ArrowLeft size={15}/> Retour</Link><div className="panel p-5 md:p-6 mb-5"><div className="text-xs font-extrabold tracking-[.15em] uppercase text-[#b51f30]">{installation.banner}</div><h1 className="text-2xl md:text-3xl font-bold mt-2">{installation.storeName}</h1><div className="flex flex-wrap gap-4 muted text-sm mt-3"><span className="flex items-center gap-1.5"><MapPin size={15}/>{installation.city}</span>{installation.supervisor&&<span>Superviseur : {installation.supervisor}</span>}{installation.deadline&&<span>Échéance : {installation.deadline.toLocaleDateString('fr-FR')}</span>}</div>{installation.techSheetUrl&&<a href={installation.techSheetUrl} target="_blank" rel="noreferrer" className="btn btn-secondary mt-5"><FileText size={16}/> Télécharger / ouvrir la fiche technique PDF</a>}</div><StoreClient installation={{id:installation.id,storeName:installation.storeName,status:installation.status,measurements:installation.measurements as Record<string, any>|null,photos:installation.photos,techSheetUrl:installation.techSheetUrl}} readOnly={user.role==='ADMIN'}/></div></main>;
}
