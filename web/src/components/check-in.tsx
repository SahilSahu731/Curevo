'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, LockKeyhole, X } from 'lucide-react';
import { causes, emotions, emotionBySlug, intentions } from '@/lib/taxonomy';
import { api, track } from '@/lib/client';
import type { CheckInResult } from '@/lib/types';
import { useCurevo } from './curevo-provider';
import ThoughtCard from './thought-card';

type TurnstileApi = { render:(element:HTMLElement,options:Record<string,unknown>)=>string; remove:(id:string)=>void };
function BotCheck({siteKey,onToken}:{siteKey:string;onToken:(token:string)=>void}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    let widget:string|undefined;let cancelled=false;
    function render(){const turnstile=(window as unknown as {turnstile?:TurnstileApi}).turnstile;if(!cancelled&&turnstile&&host.current)widget=turnstile.render(host.current,{sitekey:siteKey,theme:'light',callback:onToken,'expired-callback':()=>onToken('')});}
    const existing=document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if(existing){if((window as unknown as {turnstile?:TurnstileApi}).turnstile)render();else existing.addEventListener('load',render);}
    else{const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.dataset.turnstile='true';script.async=true;script.addEventListener('load',render);document.head.appendChild(script);}
    return()=>{cancelled=true;if(widget)(window as unknown as {turnstile?:TurnstileApi}).turnstile?.remove(widget);existing?.removeEventListener('load',render);};
  },[siteKey,onToken]);
  return <div ref={host} aria-label="Security verification"/>;
}

export default function CheckIn({initialEmotion,eventSlug,nowEventId,onClose,onComplete}:{initialEmotion?:string;eventSlug?:string;nowEventId?:string;onClose:()=>void;onComplete:()=>void}){
  const {identity,login}=useCurevo();
  const dialog=useRef<HTMLDialogElement>(null);
  const [step,setStep]=useState(initialEmotion?1:0);
  const [emotion,setEmotion]=useState(initialEmotion||'');
  const [intensity,setIntensity]=useState(3);
  const [cause,setCause]=useState('');
  const [thought,setThought]=useState('');
  const [intention,setIntention]=useState('');
  const [visibility,setVisibility]=useState<'public'|'private'>('public');
  const [ageConfirmed,setAgeConfirmed]=useState(false);
  const [participate,setParticipate]=useState(true);
  const [token,setToken]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [result,setResult]=useState<CheckInResult|null>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{dialog.current?.showModal();const node=dialog.current;return()=>node?.close();},[]);
  useEffect(()=>{heading.current?.focus();},[step,result]);
  const titles=['How are you feeling?','How strong is that feeling?','What’s behind it?','What’s on your mind?','What do you feel like doing?','A thought, shared on your terms.'];
  const subtitles=['All feelings belong here. Pick the one that’s closest.','There’s no right answer. This is your own measure.','Sometimes naming it is a place to start.','Say it how you’d actually say it. You don’t need to make it sound good.','An intention, not a commitment. It’s okay not to know.','Your identity never appears alongside your thought.'];
  const valid=[Boolean(emotion),true,Boolean(cause),thought.trim().length>=3,Boolean(intention),ageConfirmed][step];
  async function submit(){setBusy(true);setError('');try{const res=await api<CheckInResult>('/api/checkins',{method:'POST',body:JSON.stringify({emotion,intensity,cause,thought:thought.trim(),intention,visibility,participateInAggregates:participate,ageConfirmed,eventSlug,nowEventId,turnstileToken:token||undefined})});setResult(res);track('checkin_completed');if(res.mirror.length)track('mirror_viewed');onComplete();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <dialog ref={dialog} className="checkin-dialog" onCancel={e=>{e.preventDefault();if(!busy)onClose();}} aria-labelledby="checkin-title"><div className="checkin-top"><span className="eyebrow">{result?'YOUR MIRROR':'A MOMENT FOR YOU'}</span><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close check-in"><X/></button></div>
    {result?<div className="checkin-result"><div className="result-symbol" aria-hidden="true">{emotionBySlug(emotion).symbol}</div><h2 ref={heading} tabIndex={-1} id="checkin-title">{result.safety?'You deserve support.':visibility==='private'?'A little space, just for you.':'A feeling shared.'}</h2><p className="lead">{result.message||'Thank you for putting a little of your world into words.'}</p>{result.safety&&<div className="notice"><p>If you might act on thoughts of harming yourself or someone else, contact local emergency services or a trusted person now. Curevo is not monitored for emergencies.</p><Link href="/safety" className="button button-dark" onClick={onClose}>Find human support <ArrowUpRightIcon/></Link></div>}
      {result.mirror.length>0?<><div className="section-heading"><h3>Somewhere, someone gets it.</h3><span>Thoughts with feelings in common</span></div><div className="stack">{result.mirror.map(t=><ThoughtCard key={t.id} thought={t}/>)}</div></>:<div className="mirror-empty"><span aria-hidden="true">◌ ◌ ◌</span><h3>There’s room for someone like you.</h3><p>There aren’t enough similar public thoughts to show yet. Yours might be the one someone else needs to read.</p></div>}
      <div className="result-actions"><button className="button button-dark" onClick={onClose}>Back to the Pulse <ArrowRight size={19}/></button>{!identity?.authenticated&&<button className="link-button" onClick={()=>void login()}>Keep your history with Google →</button>}</div></div>:<>
    <div className="step-indicator" aria-label={`Step ${step+1} of 6`}>{titles.map((_,i)=><span key={i} className={i<=step?'filled':''}/>)}</div><div className="checkin-heading"><span className="step-number">0{step+1} / 06</span><h2 ref={heading} tabIndex={-1} id="checkin-title">{titles[step]}</h2><p>{subtitles[step]}</p></div>
    <div className="checkin-content">
      {step===0&&<div className="emotion-picker">{emotions.map(e=><button key={e.slug} className={`emotion-option ${emotion===e.slug?'selected':''}`} aria-pressed={emotion===e.slug} onClick={()=>{setEmotion(e.slug);track('emotion_selected');}}><span className="emotion-symbol" style={{color:e.color}} aria-hidden="true">{e.symbol}</span>{e.name}{emotion===e.slug&&<Check size={17}/>}</button>)}</div>}
      {step===1&&<div className="intensity-picker"><span className="big-emotion" style={{color:emotionBySlug(emotion).color}} aria-hidden="true">{emotionBySlug(emotion).symbol}</span><div className="intensity-values">{[1,2,3,4,5].map(n=><button key={n} aria-label={`Intensity ${n} of 5`} aria-pressed={intensity===n} className={intensity===n?'selected':''} onClick={()=>setIntensity(n)}>{n}</button>)}</div><div className="intensity-labels"><span>Barely there</span><span>All-consuming</span></div></div>}
      {step===2&&<div className="choice-grid">{causes.map(c=><button key={c} className={`choice ${cause===c?'selected':''}`} aria-pressed={cause===c} onClick={()=>{setCause(c);track('cause_selected');}}>{c}</button>)}</div>}
      {step===3&&<><label className="sr-only" htmlFor="thought-input">Your thought</label><textarea id="thought-input" className="thought-input" placeholder="Lately, I’ve been thinking…" maxLength={350} value={thought} onChange={e=>setThought(e.target.value)} autoFocus/><div className="textarea-bottom"><span>Leave out names, contact details, and identifying information.</span><span>{thought.length} / 350</span></div></>}
      {step===4&&<div className="choice-grid">{intentions.map(item=><button key={item} className={`choice ${intention===item?'selected':''}`} aria-pressed={intention===item} onClick={()=>setIntention(item)}>{item}</button>)}</div>}
      {step===5&&<div className="stack"><div className="thought-preview"><div className="eyebrow">{emotionBySlug(emotion).name} · {cause}</div><p>“{thought}”</p><span className="muted">I feel like: {intention.toLowerCase()}</span></div><div className="visibility-options"><button className={`choice ${visibility==='public'?'selected':''}`} aria-pressed={visibility==='public'} onClick={()=>setVisibility('public')}><span>Share anonymously</span><small>Others can discover this thought after review.</small></button><button className={`choice ${visibility==='private'?'selected':''}`} aria-pressed={visibility==='private'} onClick={()=>setVisibility('private')}><span><LockKeyhole size={17}/> Keep it private</span><small>Visible only in your own Curevo.</small></button></div><label className="checkbox-row"><input type="checkbox" checked={participate} onChange={e=>setParticipate(e.target.checked)}/><span>Include my feeling in anonymous group statistics. My private thought text stays private.</span></label><label className="checkbox-row"><input type="checkbox" checked={ageConfirmed} onChange={e=>setAgeConfirmed(e.target.checked)}/><span>I’m 18 or older and agree to the <Link href="/terms" target="_blank">terms</Link> and <Link href="/community-guidelines" target="_blank">community guidelines</Link>.</span></label>{identity?.turnstileSiteKey&&<BotCheck siteKey={identity.turnstileSiteKey} onToken={setToken}/>}</div>}
    </div>{error&&<p className="error-message" role="alert">{error}</p>}<div className="checkin-bottom"><button className="link-button" disabled={busy} onClick={()=>step?setStep(step-1):onClose()}><ArrowLeft size={18}/>{step?'Back':'Not right now'}</button><button className="button button-dark" disabled={!valid||busy||(step===5&&!!identity?.turnstileSiteKey&&!token)} onClick={()=>{if(step<5){setError('');setStep(step+1);}else void submit();}}>{busy?'Making space…':step===5?(visibility==='private'?'Save privately':'Send to the Pulse'):'Continue'}{!busy&&<ArrowRight size={19}/>}</button></div><p className="checkin-privacy"><LockKeyhole size={14}/> No public profiles. No followers. Just a real feeling.</p></>}
  </dialog>;
}
function ArrowUpRightIcon(){return <ArrowRight size={18} style={{transform:'rotate(-45deg)'}}/>;}
