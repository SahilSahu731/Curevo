'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Plus, Menu, X, Bookmark, Radio, Search, CircleUserRound } from 'lucide-react';
import type { Identity, Thought } from '@/lib/types';
import { api, track } from '@/lib/client';
import CheckIn from './check-in';

type ContextValue = { identity:Identity|null; openCheckIn:(emotion?:string,eventSlug?:string,nowEventId?:string)=>void; login:()=>Promise<void>; savedIds:string[]; toggleSave:(thought:Thought)=>Promise<void>; refreshKey:number; notify:(message:string)=>void; consent:boolean; setConsent:(value:boolean)=>void };
const Context = createContext<ContextValue | null>(null);
export function useCurevo() { const ctx=useContext(Context); if(!ctx) throw new Error('CurevoProvider required'); return ctx; }
export default function CurevoProvider({children}:{children:React.ReactNode}) {
  const [identity,setIdentity]=useState<Identity|null>(null);
  const [checkIn,setCheckIn]=useState<{emotion?:string;eventSlug?:string;nowEventId?:string}|null>(null);
  const [savedIds,setSavedIds]=useState<string[]>([]);
  const [refreshKey,setRefreshKey]=useState(0);
  const [toast,setToast]=useState('');
  const [consent,updateConsent]=useState(false);
  const [online,setOnline]=useState(true);
  const [menu,setMenu]=useState(false);
  const [connection,setConnection]=useState('Refreshing every 15s');
  const [migration,setMigration]=useState<string[]>([]);
  const pathname=usePathname();
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const notify=useCallback((message:string)=>{setToast(message); if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),5000);},[]);
  const refresh=useCallback(()=>{setRefreshKey(v=>v+1);window.dispatchEvent(new Event('curevo:update'));},[]);
  useEffect(()=>{
    let active=true;
    let local:string[]=[];
    try { local=JSON.parse(localStorage.getItem('curevo-saved')||'[]').filter((v:unknown)=>typeof v==='string'); }catch{}
    setSavedIds(local); updateConsent(localStorage.getItem('curevo-analytics')==='yes');
    api<Identity>('/api/identity').then(async data=>{if(!active)return;setIdentity(data); if(data.authenticated){ const cloud=await api<{thoughts:Thought[]}>('/api/saved');if(active){setSavedIds(cloud.thoughts.map(t=>t.id));if(local.length)setMigration(local);}}}).catch(()=>{});
    const offline=()=>setOnline(false), connected=()=>setOnline(true);
    setOnline(navigator.onLine);window.addEventListener('offline',offline);window.addEventListener('online',connected);
    if('serviceWorker' in navigator)void navigator.serviceWorker.register('/sw.js').catch(()=>{});
    return()=>{active=false;window.removeEventListener('offline',offline);window.removeEventListener('online',connected);};
  },[]);
  useEffect(()=>{
    if(!identity?.realtimeEnabled)return;
    let dispose:(()=>void)|undefined; let cancelled=false;
    import('ably').then(({Realtime})=>{
      if(cancelled)return;
      const client=new Realtime({authUrl:'/api/realtime/auth',authMethod:'GET'});
      client.connection.on('connected',()=>setConnection('Connected live'));
      client.connection.on('disconnected',()=>setConnection('Reconnecting · updates every 15s'));
      client.connection.on('failed',()=>setConnection('Updates every 15s'));
      void client.channels.get('pulse:global').subscribe(()=>refresh());
      dispose=()=>client.close();
    }).catch(()=>setConnection('Updates every 15s'));
    return()=>{cancelled=true;dispose?.();};
  },[identity?.realtimeEnabled,refresh]);
  const openCheckIn=useCallback((emotion?:string,eventSlug?:string,nowEventId?:string)=>{setCheckIn({emotion,eventSlug,nowEventId});setMenu(false);track('checkin_started');},[]);
  const login=useCallback(async()=>{
    if(!identity?.googleEnabled){notify('Google sign-in is not configured yet. You can keep using Curevo as a guest.');return;}
    try{track('signup_started');const data=await api<{url?:string}>('/api/auth/sign-in/social',{method:'POST',body:JSON.stringify({provider:'google',callbackURL:'/me'})}); if(data.url)window.location.assign(data.url);else notify('Could not start sign-in. Please try again.');}catch(e){notify((e as Error).message);}
  },[identity,notify]);
  const toggleSave=useCallback(async(thought:Thought)=>{
    const active=!savedIds.includes(thought.id);
    if(identity?.authenticated)await api('/api/saved',{method:'POST',body:JSON.stringify({checkInId:thought.id,active})});
    const next=active?[...savedIds,thought.id]:savedIds.filter(id=>id!==thought.id);
    setSavedIds(next);if(!identity?.authenticated)localStorage.setItem('curevo-saved',JSON.stringify(next));
    notify(active?'Saved for another moment.':'Removed from saved thoughts.');if(active)track('thought_saved');refresh();
  },[identity,savedIds,notify,refresh]);
  function setConsent(value:boolean){updateConsent(value);localStorage.setItem('curevo-analytics',value?'yes':'no');}
  async function migrate(){try{await api('/api/saved/migrate',{method:'POST',body:JSON.stringify({ids:migration})});localStorage.removeItem('curevo-saved');setSavedIds([...new Set([...savedIds,...migration])]);setMigration([]);notify('Your saved thoughts are now synced.');refresh();}catch(e){notify((e as Error).message);}}
  const nav=[['/','The Pulse'],['/humanity','Humanity'],['/now','Curevo Now'],['/me','Your Curevo']];
  return <Context.Provider value={{identity,openCheckIn,login,savedIds,toggleSave,refreshKey,notify,consent,setConsent}}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><Link href="/" className="brand" aria-label="Curevo home"><span className="brand-symbol" aria-hidden="true">✳</span> curevo<span className="brand-period">.</span></Link><nav className="desktop-nav" aria-label="Main navigation">{nav.map(([url,label])=><Link key={url} href={url} aria-current={pathname===url?'page':undefined}>{label}</Link>)}</nav><div className="header-actions"><Link href="/saved" className="icon-button desktop-save" aria-label="Saved thoughts"><Bookmark size={21}/></Link><button className="button button-dark header-checkin" onClick={()=>openCheckIn()}>How are you feeling? <ArrowUpRight size={18}/></button><button className="icon-button menu-button" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div></header>
    {menu&&<nav className="mobile-menu" aria-label="Mobile navigation">{nav.map(([url,label])=><Link key={url} href={url} onClick={()=>setMenu(false)}>{label}<ArrowUpRight size={19}/></Link>)}<Link href="/saved" onClick={()=>setMenu(false)}>Saved thoughts <Bookmark size={19}/></Link></nav>}
    {!online&&<div className="offline-notice" role="status">You’re offline. Your unsent thought stays here until you reconnect.</div>}
    {migration.length>0&&<div className="migration-banner"><span>Bring your {migration.length} saved thoughts into your account?</span><button className="link-button" onClick={()=>void migrate()}>Sync saved thoughts →</button><button className="icon-button" aria-label="Dismiss saved sync" onClick={()=>setMigration([])}><X size={18}/></button></div>}
    <main id="main">{children}</main>
    <footer className="site-footer"><div className="footer-top"><Link href="/" className="brand">✳ curevo.</Link><p>There’s a little of all of us<br/>in every feeling.</p><div className="footer-nav"><Link href="/humanity">Explore humanity</Link><Link href="/now">Join Curevo Now</Link><Link href="/community-guidelines">Community guidelines</Link><Link href="/safety">Find support</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Curevo · Humanity, right now.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/data">Your data</Link></div><span className="connection-state"><i className={online?'status-dot':'status-dot disconnected'}/>{online?connection:'Offline'}</span></div></footer>
    <nav className="bottom-nav" aria-label="Quick navigation"><Link href="/" aria-label="The Pulse"><Radio size={22}/><span>Pulse</span></Link><Link href="/humanity"><Search size={22}/><span>Humanity</span></Link><button className="mobile-feel" onClick={()=>openCheckIn()} aria-label="Share a feeling"><Plus size={25}/></button><Link href="/saved"><Bookmark size={22}/><span>Saved</span></Link><Link href="/me"><CircleUserRound size={22}/><span>Me</span></Link></nav>
    {checkIn&&<CheckIn initialEmotion={checkIn.emotion} eventSlug={checkIn.eventSlug} nowEventId={checkIn.nowEventId} onClose={()=>setCheckIn(null)} onComplete={refresh}/>}
    {toast&&<div className="toast" role="status">{toast}<button aria-label="Dismiss message" onClick={()=>setToast('')}><X size={17}/></button></div>}
  </Context.Provider>;
}
