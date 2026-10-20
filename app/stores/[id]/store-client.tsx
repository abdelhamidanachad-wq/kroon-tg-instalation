'use client';
import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2, ExternalLink, Ruler, Save, UploadCloud, MapPin, Clock3, ShieldCheck } from 'lucide-react';
import { STATUS_LABELS } from '@/lib/status';

type MeasurementFields = { faceH: string; faceL: string; frontonH: string; frontonL: string; plintheH: string; plintheL: string; coteH: string; coteTop: string; coteBottom: string };
type PhotoProof = { capturedAt: string; latitude: number; longitude: number; accuracy: number };
type StoreInfo = { id: string; storeName: string; status: string; measurements: Record<string, any> | null; photos: string[]; photoProofs?: PhotoProof[]; techSheetUrl: string | null; installationType?: string; city?: string };
const empty: MeasurementFields = { faceH:'',faceL:'',frontonH:'',frontonL:'',plintheH:'',plintheL:'',coteH:'',coteTop:'',coteBottom:'' };

function fromMeasurements(m: Record<string, any> | null): MeasurementFields {
  if (!m) return empty;
  return { faceH:String(m.face?.height??''), faceL:String(m.face?.width??''), frontonH:String(m.fronton?.height??''), frontonL:String(m.fronton?.width??''), plintheH:String(m.plinthe?.height??''), plintheL:String(m.plinthe?.width??''), coteH:String(m.cotes?.globalHeight??''), coteTop:String(m.cotes?.topWidth??''), coteBottom:String(m.cotes?.bottomWidth??'') };
}
function formatCoord(value:number){return value.toFixed(6);}
async function stampPhoto(file:File, meta:{capturedAt:string;latitude:number;longitude:number;accuracy:number;storeName:string;city:string;type:string}):Promise<File>{
  const bitmap=await createImageBitmap(file);
  const max=2200, scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Impossible de préparer la photo.');
  ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
  const panelH=Math.max(106,Math.round(canvas.height*.13));const pad=Math.max(14,Math.round(canvas.width*.018));
  ctx.fillStyle='rgba(13,25,43,.82)';ctx.fillRect(0,canvas.height-panelH,canvas.width,panelH);
  const fontSize=Math.max(13,Math.round(canvas.width*.018));ctx.fillStyle='#ffffff';ctx.font=`600 ${fontSize}px Arial, sans-serif`;ctx.textBaseline='top';
  const lines=[`SMOLLAN | KROON — ${meta.type}`,meta.storeName.slice(0,64)+ (meta.city?` · ${meta.city}`:''),new Date(meta.capturedAt).toLocaleString('fr-MA',{dateStyle:'medium',timeStyle:'medium'}),`GPS ${formatCoord(meta.latitude)}, ${formatCoord(meta.longitude)} · ±${Math.round(meta.accuracy)} m`];
  lines.forEach((line,i)=>ctx.fillText(line,pad,canvas.height-panelH+pad+i*(fontSize+5),canvas.width-pad*2));
  const blob:Blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Échec du traitement de la photo.')),'image/jpeg',.9));
  const base=file.name.replace(/\.[^.]+$/,'')||'installation';
  return new File([blob],`${base}-gps.jpg`,{type:'image/jpeg',lastModified:Date.now()});
}
export default function StoreClient({ installation, readOnly=false }: { installation: StoreInfo; readOnly?: boolean }) {
  const router = useRouter(); const [fields,setFields]=useState<MeasurementFields>(()=>fromMeasurements(installation.measurements));
  const [photos,setPhotos]=useState(installation.photos); const [photoProofs,setPhotoProofs]=useState<PhotoProof[]>(installation.photoProofs||[]);
  const [status,setStatus]=useState(installation.status); const [measurementsSaved,setMeasurementsSaved]=useState(!!installation.measurements);
  const [files,setFiles]=useState<File[]>([]); const [proofs,setProofs]=useState<PhotoProof[]>([]); const [notice,setNotice]=useState(''); const [error,setError]=useState(''); const [saving,setSaving]=useState(false); const [capturing,setCapturing]=useState(false);
  const fileRef=useRef<HTMLInputElement|null>(null);
  const hasMeasures=useMemo(()=>(Object.values(fields) as string[]).every(v=>v.trim()!==''&&Number.isFinite(Number(v))&&Number(v)>0),[fields]);
  function updateField(key:keyof MeasurementFields,value:string){setFields(old=>({...old,[key]:value}));}
  async function saveMeasurements(){setSaving(true);setError('');setNotice('');try{
    if(!hasMeasures)throw new Error('Renseignez les 9 mesures avec des valeurs positives (en cm).');
    const measurements={unit:'cm',face:{height:Number(fields.faceH),width:Number(fields.faceL)},fronton:{height:Number(fields.frontonH),width:Number(fields.frontonL)},plinthe:{height:Number(fields.plintheH),width:Number(fields.plintheL)},cotes:{globalHeight:Number(fields.coteH),topWidth:Number(fields.coteTop),bottomWidth:Number(fields.coteBottom)}};
    const res=await fetch(`/api/installations/${installation.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({measurements})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Impossible de sauvegarder les mesures.');setStatus(data.installation.status);setMeasurementsSaved(true);setNotice('Mesures sauvegardées.');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Erreur inconnue');}finally{setSaving(false);}}
  async function capturePhotos(e:ChangeEvent<HTMLInputElement>){
    const selected=Array.from(e.target.files||[]);e.target.value='';if(!selected.length)return;
    setCapturing(true);setError('');setNotice('');
    try{
      if(photos.length+files.length+selected.length>5)throw new Error(`Maximum 5 photos par magasin. Vous en avez déjà ${photos.length+files.length} en préparation ou enregistrées.`);
      if(!navigator.geolocation)throw new Error('La géolocalisation n’est pas disponible dans ce navigateur.');
      const pos=await new Promise<GeolocationPosition>((resolve,reject)=>navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:20000,maximumAge:0}));
      const capturedAt=new Date().toISOString();const meta={capturedAt,latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy,storeName:installation.storeName,city:installation.city||'',type:installation.installationType==='STAND'?'STAND':'TG'};
      const stamped:File[]=[];for(const file of selected){if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Format non accepté. Utilisez JPG, PNG ou WebP.');if(file.size>10*1024*1024)throw new Error('Chaque photo doit faire 10 Mo maximum.');stamped.push(await stampPhoto(file,meta));}
      setFiles(old=>[...old,...stamped]);setProofs(old=>[...old,...stamped.map(()=>({capturedAt,latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy}))]);
      setNotice(`${stamped.length} photo(s) préparée(s) avec heure et coordonnées GPS visibles.`);
    }catch(err){const geo=err as GeolocationPositionError; if(geo?.code===1)setError('Autorisez la localisation dans le navigateur puis réessayez.');else if(geo?.code===2)setError('Position GPS indisponible. Déplacez-vous à un endroit dégagé et réessayez.');else if(geo?.code===3)setError('Délai GPS dépassé. Réessayez.');else setError(err instanceof Error?err.message:'Capture GPS impossible.');}
    finally{setCapturing(false);}
  }
  async function uploadPhotos(){setSaving(true);setError('');setNotice('');try{
    if(!files.length)throw new Error('Prenez d’abord une photo avec le bouton de capture GPS.');if(photos.length+files.length>5)throw new Error(`Maximum 5 photos. Vous en avez déjà ${photos.length}.`);
    const body=new FormData();files.forEach(f=>body.append('photos',f));body.append('proofs',JSON.stringify(proofs));const res=await fetch(`/api/installations/${installation.id}/photos`,{method:'POST',body});const data=await res.json();if(!res.ok)throw new Error(data.error||'Upload échoué.');
    setPhotos(data.photos);setPhotoProofs(data.photoProofs||[]);setFiles([]);setProofs([]);if(fileRef.current)fileRef.current.value='';setNotice('Photos envoyées avec heure/GPS et métadonnées sauvegardées.');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Erreur inconnue');}finally{setSaving(false);}}
  async function markInstalled(){setSaving(true);setError('');setNotice('');try{const res=await fetch(`/api/installations/${installation.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'INSTALLE'})});const data=await res.json();if(!res.ok)throw new Error(data.error||'Impossible de valider l’installation.');setStatus(data.installation.status);setNotice('Installation marquée comme installée.');router.refresh();}catch(e){setError(e instanceof Error?e.message:'Erreur inconnue');}finally{setSaving(false);}}
  const inputClass='field mt-1';
  function measure(label:string,key:keyof MeasurementFields){return <label className="block text-sm font-semibold" key={key}>{label}<div className="relative mt-1"><input type="number" inputMode="decimal" min="0.1" step="0.1" className={inputClass} disabled={readOnly||saving} value={fields[key]} onChange={e=>updateField(key,e.target.value)} placeholder="cm"/><span className="absolute right-3 top-3 muted text-xs">cm</span></div></label>}
  return <div className="space-y-5">
    {notice&&<div role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</div>}{error&&<div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
    <section className="panel p-5 md:p-6"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Ruler size={18} className="text-[#b51f30]"/><h2 className="font-bold text-lg">Fiche de mesures</h2></div><p className="muted text-sm mt-1">Toutes les mesures sont enregistrées en centimètres (cm).</p></div><span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold whitespace-nowrap">{STATUS_LABELS[status]}</span></div>
      <div className="grid md:grid-cols-2 gap-5 mt-5"><div className="rounded-xl border border-slate-100 p-4"><h3 className="font-bold mb-3">Face</h3><div className="grid grid-cols-2 gap-3">{measure('Hauteur','faceH')}{measure('Largeur','faceL')}</div></div><div className="rounded-xl border border-slate-100 p-4"><h3 className="font-bold mb-3">Fronton</h3><div className="grid grid-cols-2 gap-3">{measure('Hauteur','frontonH')}{measure('Largeur','frontonL')}</div></div><div className="rounded-xl border border-slate-100 p-4"><h3 className="font-bold mb-3">Plinthe</h3><div className="grid grid-cols-2 gap-3">{measure('Hauteur','plintheH')}{measure('Largeur','plintheL')}</div></div><div className="rounded-xl border border-slate-100 p-4"><h3 className="font-bold mb-3">Côtés</h3><div className="grid grid-cols-2 gap-3">{measure('Hauteur globale','coteH')}{measure('Largeur en haut','coteTop')}{measure('Largeur en bas','coteBottom')}</div></div></div>
      {!readOnly&&<div className="mt-5 flex flex-wrap gap-2"><button className="btn" onClick={saveMeasurements} disabled={saving}><Save size={16}/>{saving?'Sauvegarde…':'Sauvegarder les mesures'}</button>{installation.measurements&&<span className="text-xs muted self-center">Dernières mesures chargées depuis la base.</span>}</div>}
    </section>
    <section className="panel p-5 md:p-6"><div className="flex items-center gap-2"><Camera size={18} className="text-[#b51f30]"/><h2 className="font-bold text-lg">Preuves photo — {installation.installationType==='STAND'?'Installation Stand':'Installation TG'}</h2></div><p className="muted text-sm mt-1">Chaque photo prise depuis ce lien mobile affichera l’heure de capture, le nom du magasin et les coordonnées GPS. Autorisez la localisation lorsque votre navigateur le demande.</p>
      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm flex gap-2"><ShieldCheck size={17} className="text-emerald-700 shrink-0 mt-0.5"/><span>Capture guidée : coordonnées GPS à jour (haute précision demandée), heure enregistrée, filigrane visible et métadonnées conservées au serveur. Une photo importée hors de ce flux est refusée par l’API.</span></div>
      <div className="flex gap-2 items-center mt-4"><span className="text-2xl font-extrabold">{photos.length}</span><span className="muted text-sm">/ 5 photos sauvegardées</span><div className="ml-auto h-2 rounded-full bg-slate-100 w-28 overflow-hidden"><div className="h-full bg-emerald-500" style={{width:`${photos.length*20}%`}}/></div></div>
      {photos.length>0&&<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-4">{photos.map((p,i)=><a href={p} target="_blank" rel="noreferrer" key={p} className="block rounded-xl overflow-hidden bg-slate-100 aspect-square relative"><img src={p} alt={`Photo installation ${i+1}`} className="w-full h-full object-cover"/><span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{i+1} <ExternalLink size={11} className="inline"/></span></a>)}</div>}
      {photoProofs.length>0&&<div className="mt-3 space-y-1">{photoProofs.map((proof,i)=><div key={i} className="text-xs muted flex flex-wrap gap-x-2"><Clock3 size={13}/><span>{new Date(proof.capturedAt).toLocaleString('fr-MA')}</span><MapPin size={13}/><span>{formatCoord(proof.latitude)}, {formatCoord(proof.longitude)} (±{Math.round(proof.accuracy)} m)</span></div>)}</div>}
      {!readOnly&&photos.length<5&&<div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><label htmlFor="photos-input" className="block text-sm font-bold mb-2">Prendre / choisir des photos à capturer avec GPS</label><input ref={fileRef} id="photos-input" className="block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" multiple onChange={capturePhotos} disabled={saving||capturing}/>{capturing&&<p className="muted text-xs mt-2">Récupération du GPS et préparation du filigrane…</p>}{files.length>0&&<div className="mt-3 space-y-2">{files.map((f,i)=><div key={i} className="flex items-center gap-3 text-sm"><img src={URL.createObjectURL(f)} alt="" className="w-12 h-12 rounded-lg object-cover"/><span className="flex-1 truncate">{f.name}</span><span className="text-emerald-700 text-xs font-semibold">GPS + heure</span><button className="text-red-700 text-xs" onClick={()=>{setFiles(old=>old.filter((_,n)=>n!==i));setProofs(old=>old.filter((_,n)=>n!==i));}}>Retirer</button></div>)}</div>}<p className="muted text-xs mt-2">JPG, PNG ou WebP · 10 Mo max par photo · les photos passent en JPEG après ajout du filigrane.</p><button className="btn mt-3" onClick={uploadPhotos} disabled={saving||capturing||!files.length}><UploadCloud size={16}/>{saving?'Envoi…':`Envoyer ${files.length||''} photo(s)`}</button></div>}
    </section>
    {!readOnly&&<section className="panel p-5 md:p-6"><h2 className="font-bold text-lg">Validation de l’installation</h2><p className="muted text-sm mt-1">La validation est possible lorsque les mesures sont sauvegardées et qu’au moins 3 photos documentées sont disponibles.</p><button className="btn btn-red mt-4 w-full sm:w-auto" onClick={markInstalled} disabled={saving||status==='INSTALLE'||photos.length<3||!measurementsSaved}><CheckCircle2 size={17}/>{status==='INSTALLE'?'Installation validée':'Marquer comme installé'}</button>{(photos.length<3||!measurementsSaved)&&<p className="text-xs text-amber-700 mt-2">{photos.length<3?'Ajoutez au moins 3 photos documentées. ':''}{!measurementsSaved?'Sauvegardez les mesures avant validation.':''}</p>}</section>}
  </div>;
}
