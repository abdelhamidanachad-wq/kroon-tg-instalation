'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, LogIn, PanelsTopLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connexion impossible.');
      router.replace(data.redirectTo); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Une erreur est survenue.'); }
    finally { setBusy(false); }
  }
  return <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_#e7edf8,_transparent_48%),#f5f7fb]">
    <div className="w-full max-w-[440px]">
      <div className="flex items-center justify-center gap-3 mb-8"><div className="w-12 h-12 rounded-2xl bg-[#13223a] text-white flex items-center justify-center"><PanelsTopLeft size={25}/></div><div><div className="text-xl font-extrabold tracking-tight">TG INSTALLATIONS</div><div className="text-xs tracking-[.22em] muted uppercase">Maroc · Field operations</div></div></div>
      <div className="panel p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b51f30] mb-2">Espace sécurisé</p><h1 className="text-2xl font-bold">Bienvenue</h1><p className="muted mt-2 text-sm leading-6">Connectez-vous pour suivre les installations de Têtes de Gondole.</p>
        <form onSubmit={submit} className="mt-7 space-y-4">
          <label className="block text-sm font-semibold">Identifiant<input className="field mt-2" autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Votre identifiant" required /></label>
          <label className="block text-sm font-semibold">Mot de passe<div className="relative mt-2"><LockKeyhole size={17} className="absolute left-3 top-3.5 text-slate-400"/><input className="field pl-10" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Votre mot de passe" required /></div></label>
          {error && <div role="alert" className="text-sm rounded-lg bg-red-50 text-red-700 border border-red-100 p-3">{error}</div>}
          <button className="btn w-full py-3 mt-2" type="submit" disabled={busy}>{busy ? 'Connexion…' : 'Se connecter'} <LogIn size={17}/></button>
        </form>
      </div><p className="text-center muted text-xs mt-6">SMOLLAN · Pilotage terrain des installations TG</p>
    </div>
  </main>;
}
