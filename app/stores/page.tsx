import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { STATUS_LABELS } from '@/lib/status';
import { LogOut, MapPin, FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import LogoutButton from './logout-button';

export default async function StoresPage() {
  const user = await getSession(); if (!user) redirect('/login'); if (user.role === 'ADMIN') redirect('/admin');
  const stores = await prisma.installation.findMany({ where: { providerId: user.id }, orderBy: [{ city: 'asc' }, { storeName: 'asc' }] });
  const installed = stores.filter(s => s.status === 'INSTALLE').length;
  return <main className="min-h-screen"><header className="bg-[#13223a] text-white"><div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between"><div><div className="font-extrabold tracking-wide">TG INSTALLATIONS <span className="text-red-300">MAROC</span></div><div className="text-xs text-white/65 mt-1">Espace prestataire · {user.username}</div></div><LogoutButton/></div></header>
    <div className="max-w-5xl mx-auto p-4 md:p-7"><div className="mb-6"><p className="text-xs uppercase tracking-[.18em] text-[#b51f30] font-extrabold">Votre tournée</p><h1 className="text-2xl md:text-3xl font-bold mt-2">Mes magasins</h1><p className="muted text-sm mt-2">Consultez les fiches techniques, ajoutez les mesures et documentez l’installation.</p></div>
      <div className="grid grid-cols-3 gap-3 mb-5"><div className="panel p-4"><div className="muted text-xs">Affectés</div><div className="text-2xl font-extrabold mt-1">{stores.length}</div></div><div className="panel p-4"><div className="muted text-xs">Installés</div><div className="text-2xl font-extrabold mt-1">{installed}</div></div><div className="panel p-4"><div className="muted text-xs">En cours</div><div className="text-2xl font-extrabold mt-1">{stores.length-installed}</div></div></div>
      <div className="space-y-3">{stores.map(s=><Link href={`/stores/${s.id}`} key={s.id} className="panel p-4 md:p-5 flex gap-4 items-center hover:border-slate-300 transition-colors"><div className="w-12 h-12 shrink-0 rounded-xl bg-[#edf2fa] flex items-center justify-center text-[#203854]"><MapPin size={21}/></div><div className="min-w-0 flex-1"><div className="text-xs font-bold tracking-wide uppercase text-[#b51f30]">{s.banner}</div><div className="font-bold mt-1">{s.storeName}</div><div className="muted text-sm mt-1 flex flex-wrap gap-x-3 gap-y-1"><span>{s.city}</span><span>·</span><span>{STATUS_LABELS[s.status]}</span>{s.techSheetUrl&&<span className="text-blue-700 flex items-center gap-1"><FileText size={13}/> Fiche technique disponible</span>}</div></div>{s.status==='INSTALLE'&&<CheckCircle2 className="text-emerald-600 shrink-0" size={20}/>}<ChevronRight className="muted shrink-0" size={19}/></Link>)}{stores.length===0&&<div className="panel p-8 text-center"><MapPin className="mx-auto muted" size={28}/><h2 className="font-bold mt-3">Aucun magasin affecté</h2><p className="muted text-sm mt-2">Contactez l’administrateur pour vérifier vos affectations.</p></div>}</div>
    </div></main>;
}
