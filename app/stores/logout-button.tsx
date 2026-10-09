'use client';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
export default function LogoutButton(){const router=useRouter();return <button className="text-sm flex items-center gap-2 rounded-lg border border-white/20 px-3 py-2 hover:bg-white/10" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST'});router.replace('/login');router.refresh();}}><LogOut size={15}/> Sortir</button>}
