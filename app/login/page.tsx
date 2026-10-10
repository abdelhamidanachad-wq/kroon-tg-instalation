'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, LogIn, PanelsTopLeft, UserRound } from 'lucide-react';

type ProviderOption = { username: string; label: string };

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'ADMIN' | 'PROVIDER'>('ADMIN');
  const [provider, setProvider] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  async function chooseRole(nextRole: 'ADMIN' | 'PROVIDER') {
    setRole(nextRole);
    setError('');
    setPin('');
    if (nextRole === 'PROVIDER' && providers.length === 0) {
      setLoadingProviders(true);
      try {
        const response = await fetch('/api/auth/providers', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Liste des prestataires indisponible.');
        setProviders(data.providers || []);
        if (data.providers?.length) setProvider(data.providers[0].username);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Liste des prestataires indisponible.');
      } finally {
        setLoadingProviders(false);
      }
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role === 'ADMIN' ? { role, pin } : { role, username: provider, pin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Connexion impossible.');
      router.replace(data.redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top_left,_#e7edf8,_transparent_48%),#f5f7fb]">
    <div className="w-full max-w-[440px]">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#13223a] text-white flex items-center justify-center"><PanelsTopLeft size={25}/></div>
        <div><div className="text-xl font-extrabold tracking-tight">TG INSTALLATIONS</div><div className="text-xs tracking-[.22em] muted uppercase">Maroc · Field operations</div></div>
      </div>
      <div className="panel p-7 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b51f30] mb-2">Accès équipe</p>
        <h1 className="text-2xl font-bold">Bienvenue</h1>
        <p className="muted mt-2 text-sm leading-6">Choisissez votre espace et entrez votre code PIN.</p>
        <div className="grid grid-cols-2 gap-2 mt-6" role="group" aria-label="Type d'accès">
          <button type="button" onClick={() => chooseRole('ADMIN')} className={`rounded-xl border px-3 py-3 text-sm font-bold ${role === 'ADMIN' ? 'bg-[#13223a] text-white border-[#13223a]' : 'bg-white border-slate-200 text-slate-700'}`}>
            <LockKeyhole size={17} className="inline mr-2"/>Admin
          </button>
          <button type="button" onClick={() => chooseRole('PROVIDER')} className={`rounded-xl border px-3 py-3 text-sm font-bold ${role === 'PROVIDER' ? 'bg-[#13223a] text-white border-[#13223a]' : 'bg-white border-slate-200 text-slate-700'}`}>
            <UserRound size={17} className="inline mr-2"/>Prestataire
          </button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          {role === 'PROVIDER' && <label className="block text-sm font-semibold">Votre nom
            <select className="field mt-2" value={provider} onChange={e => setProvider(e.target.value)} required disabled={loadingProviders || providers.length === 0}>
              {loadingProviders && <option value="">Chargement…</option>}
              {!loadingProviders && providers.length === 0 && <option value="">Aucun prestataire disponible</option>}
              {providers.map(item => <option key={item.username} value={item.username}>{item.label}</option>)}
            </select>
          </label>}
          <label className="block text-sm font-semibold">Code PIN
            <div className="relative mt-2">
              <LockKeyhole size={17} className="absolute left-3 top-3.5 text-slate-400"/>
              <input className="field pl-10 tracking-[.22em]" type="password" inputMode="numeric" autoComplete="current-password" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="Entrez votre PIN" minLength={4} maxLength={12} required />
            </div>
          </label>
          {error && <div role="alert" className="text-sm rounded-lg bg-red-50 text-red-700 border border-red-100 p-3">{error}</div>}
          <button className="btn w-full py-3 mt-2" type="submit" disabled={busy || (role === 'PROVIDER' && (!provider || loadingProviders || providers.length === 0))}>
            {busy ? 'Connexion…' : 'Se connecter'} <LogIn size={17}/>
          </button>
        </form>
      </div>
      <p className="text-center muted text-xs mt-6">SMOLLAN · Pilotage terrain des installations TG</p>
    </div>
  </main>;
}
