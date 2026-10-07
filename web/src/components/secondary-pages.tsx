'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowDownToLine, ArrowRight, Bookmark, Check, Clock3, Globe2, LockKeyhole, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useCurevo } from '@/components/curevo-provider';
import ThoughtCard from '@/components/thought-card';
import PulseChart from '@/components/pulse-chart';
import { api, useResource, track } from '@/lib/client';
import { causes, emotionBySlug, emotions, outcomes } from '@/lib/taxonomy';
import type { CurevoEvent, FeedResult, NowEvent, Pulse, Thought } from '@/lib/types';

function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return <header className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p>{children}</header>;
}

function ResourceState({ loading, error, retry }: { loading: boolean; error: unknown; retry: () => void }) {
  if (loading) return <div className="empty-state" role="status"><span className="eyebrow">A moment, please</span><p>Listening to the Pulse…</p></div>;
  if (error) return <div className="empty-state" role="alert"><h3>We couldn’t load this just yet.</h3><p className="muted">{String(error)}</p><button className="button button-secondary" onClick={retry}>Try again</button></div>;
  return null;
}

function EmptyThoughts({ title = 'There’s room for your perspective.', description = 'No public thoughts here yet. Share what’s on your mind to begin the conversation.' }: { title?: string; description?: string }) {
  const { openCheckIn } = useCurevo();
  return <div className="empty-state"><Sparkles size={30} strokeWidth={1.3} /><h3>{title}</h3><p className="muted">{description}</p><button className="button button-primary" onClick={() => openCheckIn()}>Join the Pulse <ArrowRight size={18} /></button></div>;
}

function Feed({ initial, endpoint, owned = false, onChanged, emptyTitle, emptyDescription }: { initial: FeedResult; endpoint: string; owned?: boolean; onChanged?: () => void; emptyTitle?: string; emptyDescription?: string }) {
  const [extra, setExtra] = useState<Thought[]>([]);
  const [nextCursor, setNextCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hidden, setHidden] = useState<string[]>([]);
  const thoughts = [...initial.thoughts, ...extra].filter((thought, index, all) => !hidden.includes(thought.id) && all.findIndex(item => item.id === thought.id) === index);
  async function loadMore() {
    if (!nextCursor || loading) return;
    setLoading(true); setError('');
    try {
      const result = await api<FeedResult>(`${endpoint}${endpoint.includes('?') ? '&' : '?'}cursor=${encodeURIComponent(nextCursor)}`);
      setExtra(previous => [...previous, ...result.thoughts]); setNextCursor(result.nextCursor);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load more thoughts.'); }
    finally { setLoading(false); }
  }
  if (!thoughts.length) return <EmptyThoughts title={emptyTitle} description={emptyDescription} />;
  return <div className="stack"><div className="thought-grid">{thoughts.map(thought => <div className="stack" key={thought.id}><ThoughtCard thought={thought} owned={owned} onDeleted={() => { setHidden(ids => [...ids, thought.id]); onChanged?.(); }} />{owned && thought.outcomeEligible && !thought.outcome && <OutcomeForm thought={thought} onCompleted={onChanged} />}{owned && thought.outcome && <div className="notice"><span className="eyebrow">What happened next</span><p>{thought.outcome}</p></div>}</div>)}</div>{error && <p className="error-message" role="alert">{error}</p>}{nextCursor && <div><button className="button button-secondary" disabled={loading} onClick={loadMore}>{loading ? 'Loading…' : 'More human thoughts'} <ArrowRight size={18} /></button></div>}</div>;
}

function RemoteFeed({ endpoint, emptyTitle, emptyDescription }: { endpoint: string; emptyTitle?: string; emptyDescription?: string }) {
  const resource = useResource<FeedResult>(endpoint);
  return <><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && !resource.loading && <Feed key={`${endpoint}-${resource.data.thoughts.map(t => t.id).join(',')}`} initial={resource.data} endpoint={endpoint} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />}</>;
}

function Distributions({ pulse }: { pulse: Pulse }) {
  return <div className="split-grid">{[{ title: 'What’s behind the feeling', rows: pulse.causes }, { title: 'What people want to do', rows: pulse.intentions }].map(group => <section key={group.title}><h2 className="section-heading">{group.title}</h2>{!pulse.sufficientData ? <div className="notice"><p>Small groups deserve privacy.</p><p className="muted">We’ll show this breakdown when at least {pulse.cohortMinimum} people contribute to this group.</p></div> : <div className="table-list">{group.rows.map(row => <div className="list-row" key={row.label}><span>{row.label}</span><strong>{row.percentage}%</strong></div>)}{!group.rows.length && <p className="muted">No responses in this group yet.</p>}</div>}</section>)}</div>;
}

export function HumanityPage() {
  const [query, setQuery] = useState('');
  const [emotion, setEmotion] = useState('');
  const [cause, setCause] = useState('');
  const [recent, setRecent] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const params = new URLSearchParams();
  if (submittedQuery) params.set('q', submittedQuery);
  if (emotion) params.set('emotion', emotion);
  if (cause) params.set('cause', cause);
  if (recent) params.set('recent', recent);
  const endpoint = `/api/search?${params.toString()}`;
  function search(event: FormEvent) { event.preventDefault(); setSubmittedQuery(query.trim()); track('humanity_search'); }
  return <main className="page-shell"><PageHeader eyebrow="A little less alone" title="What are humans actually thinking?" description="The things we say quietly. The feelings we have in common. Real thoughts, from real moments." /><form onSubmit={search} className="stack" role="search"><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><label className="field" style={{ flex: '1 1 280px' }}><span className="field-label">Search humanity</span><input className="input" value={query} onChange={event => setQuery(event.target.value)} maxLength={160} placeholder="Feeling behind in life…" type="search" /></label><button className="button button-primary" type="submit" style={{ alignSelf: 'end' }}><Search size={18} /> Search</button></div><div className="filter-row"><label className="field"><span className="field-label">Emotion</span><select className="select" value={emotion} onChange={event => setEmotion(event.target.value)}><option value="">Every feeling</option>{emotions.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}</select></label><label className="field"><span className="field-label">Cause</span><select className="select" value={cause} onChange={event => setCause(event.target.value)}><option value="">Every part of life</option>{causes.map(item => <option key={item}>{item}</option>)}</select></label><label className="field"><span className="field-label">When</span><select className="select" value={recent} onChange={event => setRecent(event.target.value)}><option value="">Any time</option><option value="24h">Last 24 hours</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option></select></label>{(submittedQuery || emotion || cause || recent) && <button className="link-button" type="button" onClick={() => { setQuery(''); setSubmittedQuery(''); setEmotion(''); setCause(''); setRecent(''); }}>Clear filters</button>}</div></form><section style={{ marginTop: 48 }}><div className="section-heading"><h2>{submittedQuery ? `Thoughts about “${submittedQuery}”` : 'A window into other lives'}</h2><span className="muted">Anonymous. Human. Unfiltered feelings.</span></div><RemoteFeed key={endpoint} endpoint={endpoint} emptyTitle="No thoughts found just yet." emptyDescription="Try another phrase or a broader filter. Every published thought here comes from someone who chose to share." /></section><EventsList /></main>;
}

function EventsList() {
  const resource = useResource<{ events: CurevoEvent[] }>('/api/events');
  if (!resource.data?.events.length) return null;
  return <section style={{ marginTop: 80 }}><p className="eyebrow">A shared moment</p><h2 className="section-heading">What’s happening around us.</h2><div className="split-grid">{resource.data.events.map(event => <Link href={`/event/${event.slug}`} className="metric-card" key={event.slug}><span className="eyebrow">{event.sponsored ? 'Sponsored event' : 'Event Pulse'}</span><h3>{event.title}</h3><p className="muted">{event.description}</p><span className="link-button">See the feeling <ArrowRight size={18} /></span></Link>)}</div></section>;
}

export function EmotionPage({ emotion: slug }: { emotion: string }) {
  const emotion = emotions.find(item => item.slug === slug);
  const resource = useResource<{ pulse: Pulse; thoughts: Thought[]; nextCursor: string | null }>(`/api/emotions/${encodeURIComponent(slug)}`);
  const { openCheckIn } = useCurevo();
  if (!emotion) return <main className="page-shell"><PageHeader eyebrow="All the things we feel" title="We don’t know that feeling yet." description="Explore the full spectrum of human emotion on the Pulse." /><Link href="/" className="button button-primary">Back to the Pulse <ArrowRight size={18} /></Link></main>;
  return <main className="page-shell"><PageHeader eyebrow="One feeling. A thousand different lives." title={emotion.name} description={`A place for the thoughts behind feeling ${emotion.name.toLowerCase()}. Someone else might understand more than you think.`}><button className="button button-primary" onClick={() => openCheckIn(slug)}>I feel this too <span aria-hidden>{emotion.symbol}</span></button></PageHeader><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="stack"><PulseChart pulse={resource.data.pulse} compact /><Distributions pulse={resource.data.pulse} /><section><h2 className="section-heading">Behind the feeling.</h2><Feed key={resource.data.thoughts.map(t => t.id).join(',')} initial={resource.data} endpoint={`/api/checkins?emotion=${encodeURIComponent(slug)}`} /></section></div>}<div className="filter-row" style={{ marginTop: 64 }}>{emotions.filter(item => item.slug !== slug).slice(0, 8).map(item => <Link className="chip" key={item.slug} href={`/emotion/${item.slug}`}>{item.symbol} {item.name}</Link>)}</div></main>;
}

function OutcomeForm({ thought, onCompleted }: { thought: Thought; onCompleted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(outcomes[0]);
  const [note, setNote] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    try { await api('/api/outcomes', { method: 'POST', body: JSON.stringify({ checkInId: thought.id, result, note, visibility }) }); setDone(true); track('outcome_completed'); onCompleted?.(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not save your follow-up.'); }
    finally { setPending(false); }
  }
  if (done) return <div className="notice"><Check size={20} /><p>Your follow-up is saved. Thanks for coming back.</p></div>;
  return <div className="notice"><p className="eyebrow">A moment to look back</p><h3>What happened next?</h3><p>You planned to: {thought.intention.toLowerCase()}.</p>{!open ? <button className="link-button" onClick={() => setOpen(true)}>Come back to this thought <ArrowRight size={18} /></button> : <form className="stack" onSubmit={submit}><label className="field"><span className="field-label">How did it turn out?</span><select className="select" value={result} onChange={event => setResult(event.target.value)}>{outcomes.map(item => <option key={item}>{item}</option>)}</select></label><label className="field"><span className="field-label">Anything to add? (optional)</span><textarea className="textarea" maxLength={280} value={note} onChange={event => setNote(event.target.value)} rows={3} /></label><label className="field"><span className="field-label">Follow-up visibility</span><select className="select" value={visibility} onChange={event => setVisibility(event.target.value as 'public' | 'private')}><option value="private">Only me</option><option value="public">Include in anonymous outcome statistics</option></select></label>{error && <p role="alert" className="error-message">{error}</p>}<div className="filter-row"><button className="button button-primary" disabled={pending}>{pending ? 'Saving…' : 'Save follow-up'}</button><button className="link-button" type="button" onClick={() => setOpen(false)}>Maybe later</button></div></form>}</div>;
}

type MeResponse = FeedResult & { stats: { total: number; emotions: { emotion: string; count: number; percentage: number }[] }; outcomes?: { checkInId: string; result: string }[] };
export function MePage() {
  const { identity, login, openCheckIn } = useCurevo();
  const resource = useResource<MeResponse>('/api/me');
  return <main className="page-shell"><PageHeader eyebrow="A little space for you" title="Your life, as you feel it." description="A collection of moments. The things you felt, the thoughts you had, and what happened next." /><div className="filter-row" style={{ marginBottom: 40 }}><button className="button button-primary" onClick={() => openCheckIn()}>A new check-in <ArrowRight size={18} /></button><Link href="/saved" className="button button-secondary"><Bookmark size={18} /> Saved thoughts</Link><Link href="/data" className="link-button">Your data & privacy</Link></div>{!identity?.authenticated && <div className="notice" style={{ marginBottom: 40 }}><LockKeyhole size={24} /><h3>Your space, without a public profile.</h3><p>Your guest history belongs to this browser. Sign in to keep it across devices.</p><button className="button button-secondary" onClick={login}>Continue with Google <ArrowRight size={18} /></button></div>}<ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="stack"><section className="split-grid"><div className="metric-card"><span className="eyebrow">Moments you made space for</span><p style={{ fontSize: 'clamp(48px, 8vw, 88px)', lineHeight: 1.1, margin: '20px 0' }}>{resource.data.stats.total}</p><p>check-in{resource.data.stats.total === 1 ? '' : 's'}. Each one, a part of being human.</p></div><div><h2 className="section-heading">Lately, you’ve felt</h2>{resource.data.stats.emotions.length ? <div className="table-list">{resource.data.stats.emotions.map(item => { const emotion = emotionBySlug(item.emotion); return <div className="list-row" key={item.emotion}><span><span aria-hidden style={{ color: emotion.color, marginRight: 12 }}>{emotion.symbol}</span>{emotion.name}</span><strong>{item.percentage}%</strong></div>; })}</div> : <p className="muted">Your feelings will find a home here after your first check-in.</p>}</div></section><section><div className="section-heading"><h2>Your thoughts, through time.</h2><span className="muted">Public and private. Always yours.</span></div><Feed key={`${resource.data.stats.total}-${resource.data.thoughts.map(t => `${t.id}:${t.outcome ?? ''}`).join(',')}`} initial={resource.data} endpoint="/api/me" owned onChanged={resource.refresh} emptyTitle="A beginning, whenever you’re ready." emptyDescription="Your check-ins will appear here. There’s no streak to keep and no right way to feel." /></section></div>}</main>;
}

export function SavedPage() {
  const { identity, savedIds } = useCurevo();
  const endpoint = identity?.authenticated ? '/api/saved' : `/api/checkins?ids=${savedIds.map(encodeURIComponent).join(',')}`;
  return <main className="page-shell"><PageHeader eyebrow="Words that stayed with you" title="Something worth keeping." description="A thought you understood. A feeling you couldn’t quite name. A reminder that someone else gets it." />{identity?.authenticated || savedIds.length ? <RemoteFeed key={endpoint} endpoint={endpoint} emptyTitle="A little collection of connection." emptyDescription="Save a public thought when it resonates with you. Find it here whenever you need it." /> : <EmptyThoughts title="A little collection of connection." description="Tap the bookmark on a thought that stays with you. Your saved thoughts will be right here, in this browser." />}<p className="muted" style={{ marginTop: 32 }}>When a thought is deleted or removed, it also disappears from your collection.</p></main>;
}

export function ThoughtPage({ thoughtId }: { thoughtId: string }) {
  const resource = useResource<{ thought: Thought }>(`/api/checkins/${encodeURIComponent(thoughtId)}`);
  const { openCheckIn } = useCurevo();
  useEffect(() => { track('share_opened'); }, []);
  return <main className="page-shell" style={{ maxWidth: 880 }}><PageHeader eyebrow="A small window into someone’s world" title="You’re not the only one." description="Someone shared a real thought with you. No names, no profiles. Just a moment of being human." /><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <ThoughtCard thought={resource.data.thought} />}<section className="notice" style={{ marginTop: 40, padding: 'clamp(24px, 5vw, 56px)' }}><p className="eyebrow">And what about you?</p><h2>Every feeling belongs here.</h2><p>Tell us how you feel. Discover the people feeling something like you.</p><button className="button button-primary" onClick={() => openCheckIn()}>Join the Pulse <ArrowRight size={18} /></button></section></main>;
}

function Countdown({ event, onBoundary }: { event: NowEvent; onBoundary: () => void }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { const tick = () => setNow(Date.now()); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, []);
  const target = new Date(event.status === 'active' ? event.endsAt : event.startsAt).getTime();
  const remaining = now === null ? null : Math.max(0, Math.floor((target - now) / 1000));
  useEffect(() => { if (remaining === 0 && event.status !== 'completed') onBoundary(); }, [remaining, event.status, onBoundary]);
  const hours = remaining === null ? '--' : String(Math.floor(remaining / 3600)).padStart(2, '0');
  const minutes = remaining === null ? '--' : String(Math.floor(remaining / 60) % 60).padStart(2, '0');
  const seconds = remaining === null ? '--' : String(remaining % 60).padStart(2, '0');
  return <div><p className="eyebrow">{event.status === 'active' ? 'This moment closes in' : 'The next moment begins in'}</p><p aria-label={remaining === null ? 'Loading countdown' : `${hours} hours ${minutes} minutes ${seconds} seconds`} style={{ fontSize: 'clamp(40px, 9vw, 100px)', letterSpacing: '-0.055em', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2, margin: '16px 0' }}>{hours}<span style={{ opacity: .35 }}>:</span>{minutes}<span style={{ opacity: .35 }}>:</span>{seconds}</p></div>;
}

export function NowPage() {
  const resource = useResource<{ current: NowEvent; archive: NowEvent[] }>('/api/now');
  const { openCheckIn, notify } = useCurevo();
  const [selected, setSelected] = useState<string | null>(null);
  async function share() { try { await navigator.clipboard.writeText(`${window.location.origin}/now`); notify('Curevo Now link copied.'); track('thought_shared'); } catch { notify('Copy the page URL from your browser to share this moment.'); } }
  return <main className="page-shell"><PageHeader eyebrow="Curevo Now" title="Different lives. The same moment." description="One daily window to pause together. No perfect words. Just how you feel, right now." /><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="stack"><section className="split-grid"><div className="metric-card" style={{ background: '#e8e8d9' }}><Countdown event={resource.data.current} onBoundary={resource.refresh} /><p><Clock3 size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />Every day, 8:30–9:00 PM India time.</p><p className="muted">{resource.data.current.status === 'active' ? 'We’re here, together. Come as you are.' : 'A shared moment to look forward to. The regular Pulse is always open.'}</p><button className="button button-primary" disabled={resource.data.current.status !== 'active'} onClick={() => { track('curevo_now_joined'); openCheckIn(undefined, undefined, resource.data?.current.id); }}>{resource.data.current.status === 'active' ? 'I’m here. Join this moment' : 'We’ll meet here soon'} <ArrowRight size={18} /></button></div><div><p className="eyebrow">This shared moment</p><p style={{ fontSize: 'clamp(44px, 7vw, 80px)', lineHeight: 1.1, margin: '20px 0' }}>{resource.data.current.participantCount.toLocaleString()}</p><h2>people have checked in.</h2><p className="muted">Every number is a person choosing to share a little of their world.</p><button className="link-button" onClick={share}>Invite someone into the moment <ArrowRight size={18} /></button></div></section><PulseChart pulse={resource.data.current.pulse} /><Distributions pulse={resource.data.current.pulse} /><section><h2 className="section-heading">Moments we’ve shared.</h2>{!resource.data.archive.length ? <div className="notice"><p>Our shared story is just beginning.</p><p className="muted">Completed Curevo Now sessions will appear here.</p></div> : <div className="table-list">{resource.data.archive.map(event => <div key={event.id}><button className="list-row" style={{ width: '100%', textAlign: 'left', background: 'transparent', cursor: 'pointer' }} aria-expanded={selected === event.id} onClick={() => setSelected(selected === event.id ? null : event.id)}><span>{new Date(event.startsAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span><span>{event.participantCount} people <ArrowRight size={18} style={{ display: 'inline' }} /></span></button>{selected === event.id && <div style={{ padding: '32px 0' }}><PulseChart pulse={event.pulse} compact /><Distributions pulse={event.pulse} /></div>}</div>)}</div>}</section></div>}</main>;
}

export function EventPage({ eventSlug }: { eventSlug: string }) {
  const resource = useResource<{ event: CurevoEvent; pulse: Pulse; thoughts: Thought[]; nextCursor: string | null }>(`/api/events/${encodeURIComponent(eventSlug)}`);
  const { openCheckIn, notify } = useCurevo();
  async function share() { try { await navigator.clipboard.writeText(window.location.href); notify('Event link copied.'); } catch { notify('Copy the page URL from your browser to share this event.'); } }
  return <main className="page-shell"><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <><PageHeader eyebrow={resource.data.event.sponsored ? 'Sponsored event · Shared feelings' : 'One event. Many ways to feel.'} title={resource.data.event.title} description={resource.data.event.description}><h2 style={{ margin: '24px 0' }}>{resource.data.event.question}</h2><div className="filter-row"><button className="button button-primary" disabled={!resource.data.event.active} onClick={() => openCheckIn(undefined, eventSlug)}>{resource.data.event.active ? 'Add your feeling' : 'This event has ended'} <ArrowRight size={18} /></button><button className="button button-secondary" onClick={share}>Share this event</button></div></PageHeader><div className="stack"><PulseChart pulse={resource.data.pulse} /><Distributions pulse={resource.data.pulse} /><section><h2 className="section-heading">How it feels, in their words.</h2><Feed key={resource.data.thoughts.map(t => t.id).join(',')} initial={resource.data} endpoint={`/api/checkins?event=${encodeURIComponent(eventSlug)}`} /></section></div></>}</main>;
}

export function DataPage() {
  const { identity, consent, setConsent, notify, login } = useCurevo();
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState<'history' | 'account' | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  async function exportData() {
    setPending(true); setError('');
    try {
      const data = await api<unknown>('/api/data');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `curevo-data-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url); notify('Your data export is ready. Keep it somewhere private.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not export your data.'); }
    finally { setPending(false); }
  }
  async function deleteData(event: FormEvent) {
    event.preventDefault(); if (confirmation !== 'DELETE' || !deleting) return;
    setPending(true); setError('');
    try { await api('/api/data', { method: 'DELETE', body: JSON.stringify({ scope: deleting }) }); localStorage.removeItem('curevo-saved'); localStorage.removeItem('curevo-draft'); window.location.assign('/me'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete your data.'); setPending(false); }
  }
  async function signOut() {
    setPending(true); setError('');
    try { await api('/api/auth/sign-out', { method: 'POST', body: '{}' }); window.location.assign('/me'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not sign out.'); setPending(false); }
  }
  return <main className="page-shell"><PageHeader eyebrow="You’re in control" title="Your feelings. Your choices." description="Choose what you share, keep a copy of your history, or leave without leaving your thoughts behind." /><div className="stack"><section className="split-grid"><div><h2 className="section-heading">Your account</h2><p className="muted">{identity?.authenticated ? `Signed in as ${identity.user?.email ?? 'a Curevo member'}. Your name and email are never shown on your public thoughts.` : 'You’re using Curevo as a guest. Your history is linked to a secure browser cookie; saved thoughts stay in this browser until you choose to sync them.'}</p><button className="button button-secondary" disabled={pending} onClick={identity?.authenticated ? signOut : login}>{identity?.authenticated ? 'Sign out' : 'Continue with Google'} <ArrowRight size={18} /></button></div><div className="notice"><LockKeyhole size={24} /><h3>Anonymous to the community.</h3><p className="muted">Anonymous does not mean unidentifiable to the service. We use a private account or guest identifier to protect your history and prevent abuse.</p><Link href="/privacy" className="link-button">Read the privacy notice <ArrowRight size={18} /></Link></div></section><section className="table-list"><div className="list-row" style={{ alignItems: 'start', gap: 24 }}><div><h3>Optional product analytics</h3><p className="muted">Help us understand which features work. We record actions such as completing a check-in, never your thought text, search terms, or precise location. No session replay.</p></div><label style={{ display: 'flex', gap: 12, alignItems: 'center', whiteSpace: 'nowrap' }}><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} style={{ width: 22, height: 22, accentColor: '#24251f' }} />{consent ? 'Allowed' : 'Off'}</label></div><div className="list-row" style={{ alignItems: 'start', gap: 24 }}><div><h3>Public, private, and the Pulse</h3><p className="muted">Choose visibility and whether to contribute to aggregate statistics on every check-in. Public thoughts may be read and shared by anyone. Private thoughts stay out of public feeds.</p></div><ShieldCheck size={28} style={{ flexShrink: 0 }} /></div><div className="list-row" style={{ alignItems: 'start', gap: 24 }}><div><h3>Take your data with you</h3><p className="muted">Download your check-ins, follow-ups, reactions, and saved references as a JSON file. Guest saves also stay in this browser.</p></div><button className="button button-secondary" disabled={pending} onClick={exportData}><ArrowDownToLine size={18} /> Export data</button></div></section><section><h2 className="section-heading">Make a fresh start.</h2><p className="muted">Deletion is permanent in the live application. You can export your data first. Copies others have already saved or shared outside Curevo are outside our control.</p><div className="filter-row"><button className="button button-secondary" disabled={pending} onClick={() => { setDeleting('history'); setConfirmation(''); }}>Delete my history</button>{identity?.authenticated && <button className="button button-secondary" disabled={pending} onClick={() => { setDeleting('account'); setConfirmation(''); }}>Delete my account and data</button>}</div>{deleting && <form className="notice stack" onSubmit={deleteData} style={{ marginTop: 24 }}><h3>{deleting === 'account' ? 'Permanently delete your account and data?' : 'Permanently delete your history?'}</h3><p>This removes your check-ins, follow-ups, and associated activity. {deleting === 'account' && 'Your account and sessions will also be removed.'} This action cannot be undone.</p><label className="field"><span className="field-label">Type DELETE to confirm</span><input className="input" value={confirmation} autoComplete="off" onChange={event => setConfirmation(event.target.value)} /></label><div className="filter-row"><button className="button button-primary" disabled={pending || confirmation !== 'DELETE'}>{pending ? 'Deleting…' : 'Delete permanently'}</button><button className="button button-secondary" type="button" disabled={pending} onClick={() => setDeleting(null)}>Keep my data</button></div></form>}</section>{error && <p className="error-message" role="alert">{error}</p>}<InvitePasses /></div></main>;
}

type InviteResponse = { invites: { token?: string; code?: string; url?: string; used?: boolean; usedAt?: string; redeemedAt?: string }[]; remaining?: number };
function InvitePasses() {
  const { identity, notify } = useCurevo();
  const resource = useResource<InviteResponse>(identity?.betaRequired ? '/api/invites' : null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  if (!identity?.betaRequired) return null;
  async function create() {
    setPending(true); setError('');
    try { await api('/api/invites', { method: 'POST', body: '{}' }); resource.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not create an invite.'); }
    finally { setPending(false); }
  }
  async function copy(token: string) { try { await navigator.clipboard.writeText(`${window.location.origin}/join/${encodeURIComponent(token)}`); notify('Invite link copied.'); } catch { notify('Could not access your clipboard. Open the invite link and copy its address.'); } }
  return <section><h2 className="section-heading">A little room for someone else.</h2><p className="muted">Invite someone into the closed beta. Passes help us keep this space thoughtful while it grows.</p><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="table-list">{resource.data.invites.map(invite => { const token = invite.token ?? invite.code ?? ''; const used = invite.used || invite.usedAt || invite.redeemedAt; return <div className="list-row" key={token}><span>{used ? 'A pass that brought someone in' : 'One invitation to Curevo'}</span>{used ? <span className="muted">Used</span> : <button className="link-button" onClick={() => copy(token)}>Copy invitation <ArrowRight size={18} /></button>}</div>; })}<button className="button button-secondary" style={{ marginTop: 20 }} disabled={pending || resource.data.remaining === 0} onClick={create}>{pending ? 'Creating…' : 'Create an invitation'}</button></div>}{error && <p className="error-message" role="alert">{error}</p>}</section>;
}

export function JoinPage({ code }: { code: string }) {
  const [pending, setPending] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  async function redeem() {
    setPending(true); setError('');
    try { await api('/api/invites/redeem', { method: 'POST', body: JSON.stringify({ token: code }) }); setAccepted(true); }
    catch (err) { setError(err instanceof Error ? err.message : 'This invitation could not be opened.'); }
    finally { setPending(false); }
  }
  return <main className="page-shell" style={{ maxWidth: 880 }}><PageHeader eyebrow="Someone made room for you" title={accepted ? 'You’re part of the Pulse.' : 'An invitation to be human.'} description="A space for honest feelings, anonymous thoughts, and the quiet realization that someone else understands." /><div className="notice" style={{ padding: 'clamp(24px, 5vw, 48px)' }}><Globe2 size={36} strokeWidth={1.3} /><h2>{accepted ? 'Come exactly as you are.' : 'Welcome to the Curevo beta.'}</h2><p>{accepted ? 'Your invitation is ready in this browser. Let’s find out how the world is feeling.' : 'We’re starting small, with real people and real feelings. There are no followers or public profiles. Only a little more understanding.'}</p>{accepted ? <Link href="/" className="button button-primary">Meet the Pulse <ArrowRight size={18} /></Link> : <><label style={{ display: 'flex', alignItems: 'start', gap: 12, margin: '24px 0' }}><input type="checkbox" checked={ageConfirmed} onChange={event => setAgeConfirmed(event.target.checked)} style={{ width: 22, height: 22, marginTop: 3, flexShrink: 0 }} /><span>I’m 18 or older and agree to the <Link href="/terms">terms</Link> and <Link href="/community-guidelines">community guidelines</Link>.</span></label><button className="button button-primary" disabled={pending || !ageConfirmed} onClick={redeem}>{pending ? 'Opening your invitation…' : 'Accept invitation'} <ArrowRight size={18} /></>}{error && <p className="error-message" role="alert">{error}</p>}</div></main>;
}

type AdminResponse = { stats: { checkins: number; publicThoughts: number; pending: number; reports: number; participants: number }; events: CurevoEvent[]; moderationConfigured: boolean };
export function AdminPage() {
  const { identity, login } = useCurevo();
  const resource = useResource<AdminResponse>(identity?.admin ? '/api/admin' : null);
  return <main className="page-shell"><PageHeader eyebrow="Curevo operations" title="Care for the space." description="Community health, shared moments, and the work that keeps Curevo human." />{!identity?.admin ? <div className="notice"><ShieldCheck size={28} /><h3>Administrator access required.</h3><p>This area is available only to authorized moderators and administrators.</p>{!identity?.authenticated && <button className="button button-primary" onClick={login}>Sign in with Google</button>}<Link className="link-button" href="/">Back to the Pulse <ArrowRight size={18} /></Link></div> : <><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="stack"><div className="metric-grid">{Object.entries(resource.data.stats).map(([name, value]) => <div className="metric-card" key={name}><p className="eyebrow">{{ checkins: 'Total check-ins', publicThoughts: 'Public thoughts', pending: 'Awaiting review', reports: 'Open reports', participants: 'Participants' }[name]}</p><p style={{ fontSize: 44, margin: '16px 0' }}>{value.toLocaleString()}</p></div>)}</div>{!resource.data.moderationConfigured && <div className="notice"><h3>Human review is required before publication.</h3><p>Automated moderation is not configured. New public thoughts stay in the review queue until approved.</p></div>}<Link href="/admin/moderation" className="button button-primary" style={{ alignSelf: 'start' }}>Open moderation queue <ArrowRight size={18} /></Link><section><h2 className="section-heading">Shared events</h2>{resource.data.events.length ? <div className="table-list">{resource.data.events.map(event => <div key={event.slug} className="list-row"><div><Link href={`/event/${event.slug}`}>{event.title} <ArrowRight size={16} style={{ display: 'inline' }} /></Link><p className="muted">{event.active ? 'Active' : 'Closed'}{event.sponsored ? ' · Sponsored' : ''}</p></div><EventToggle event={event} onChanged={resource.refresh} /></div>)}</div> : <p className="muted">No events yet. Create one around a moment people share.</p>}</section><CreateEvent onCreated={resource.refresh} /><InvitePasses /></div>}</>}</main>;
}

function CreateEvent({ onCreated }: { onCreated: () => void }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useCurevo();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); setPending(true); setError('');
    try { await api('/api/events', { method: 'POST', body: JSON.stringify({ title: data.get('title'), slug: data.get('slug'), description: data.get('description'), question: data.get('question'), active: true, sponsored: data.get('sponsored') === 'on' }) }); form.reset(); onCreated(); notify('Your event is ready.'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not create this event.'); }
    finally { setPending(false); }
  }
  return <section className="notice"><h2 className="section-heading">Create a shared moment.</h2><form className="stack" onSubmit={submit}><div className="split-grid"><label className="field"><span className="field-label">Event title</span><input className="input" name="title" required minLength={3} maxLength={100} placeholder="The first day of a new year" /></label><label className="field"><span className="field-label">URL slug</span><input className="input" name="slug" required minLength={3} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="a-new-year" /></label></div><label className="field"><span className="field-label">Description</span><textarea className="textarea" name="description" rows={3} required maxLength={500} /></label><label className="field"><span className="field-label">The question</span><input className="input" name="question" required maxLength={180} placeholder="How does a fresh start make you feel?" /></label><label style={{ display: 'flex', gap: 12, alignItems: 'center' }}><input type="checkbox" name="sponsored" style={{ width: 22, height: 22 }} />Clearly label this as a sponsored event</label>{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary" disabled={pending} style={{ alignSelf: 'start' }}>{pending ? 'Creating…' : 'Create event'} <ArrowRight size={18} /></button></form></section>;
}

function EventToggle({ event, onChanged }: { event: CurevoEvent; onChanged: () => void }) {
  const [pending, setPending] = useState(false);
  const { notify } = useCurevo();
async function toggle() { setPending(true); try { await api('/api/events', { method: 'POST', body: JSON.stringify({ slug: event.slug, title: event.title, description: event.description, question: event.question, sponsored: event.sponsored, active: !event.active }) }); onChanged(); } catch (err) { notify(err instanceof Error ? err.message : 'Could not update event.'); } finally { setPending(false); } }
  return <button className="button button-secondary button-small" disabled={pending} onClick={toggle}>{pending ? 'Updating…' : event.active ? 'Close event' : 'Reopen event'}</button>;
}

type ModerationItem = Thought & { reasons: string[]; reportCount: number };
export function ModerationPage() {
  const { identity, login } = useCurevo();
  const [cursor, setCursor] = useState('');
  const resource = useResource<{ items: ModerationItem[]; nextCursor: string | null }>(identity?.admin ? `/api/admin/moderation${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}` : null);
  return <main className="page-shell"><PageHeader eyebrow="Community care" title="Make room for honesty. Protect the people." description="Review thoughts in context. Keep disagreement human, personal details private, and harmful content out of the Pulse." /><Link className="link-button" href="/admin">← Back to operations</Link>{!identity?.admin ? <div className="notice" style={{ marginTop: 32 }}><h3>Administrator access required.</h3><p>The moderation queue contains sensitive content and is available only to authorized administrators.</p>{!identity?.authenticated && <button className="button button-primary" onClick={login}>Sign in with Google</button>}</div> : <section style={{ marginTop: 32 }}><ResourceState loading={resource.loading} error={resource.error} retry={resource.refresh} />{resource.data && <div className="stack">{resource.data.items.length ? resource.data.items.map(item => <ModerationReview key={item.id} item={item} onReviewed={resource.refresh} />) : <div className="empty-state"><Check size={30} /><h3>You’re all caught up.</h3><p className="muted">No thoughts await review on this page.</p></div>}<div className="filter-row">{cursor && <button className="button button-secondary" onClick={() => setCursor('')}>Back to newest</button>}{resource.data.nextCursor && <button className="button button-secondary" onClick={() => setCursor(resource.data?.nextCursor ?? '')}>Next page <ArrowRight size={18} /></button>}</div></div>}</section>}</main>;
}

function ModerationReview({ item, onReviewed }: { item: ModerationItem; onReviewed: () => void }) {
  const [action, setAction] = useState('approve');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setError('');
    try { await api('/api/admin/moderation', { method: 'POST', body: JSON.stringify({ checkInId: item.id, action, reason, ...(action === 'ban' && duration !== 'permanent' ? { durationHours: Number(duration) } : {}) }) }); onReviewed(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not record this decision.'); }
    finally { setPending(false); }
  }
  return <article className="notice stack"><div className="filter-row"><span className="chip">{emotionBySlug(item.emotion).name}</span><span>{item.cause}</span><span className="muted">{item.reportCount} report{item.reportCount === 1 ? '' : 's'} · {item.moderation ?? 'Pending'}</span></div><blockquote style={{ fontSize: 'clamp(22px, 3vw, 30px)', lineHeight: 1.45, margin: 0, overflowWrap: 'anywhere' }}>{item.thought || 'No thought text supplied.'}</blockquote><p>Intention: {item.intention}</p>{item.reasons.length > 0 && <p className="muted">Review signals: {item.reasons.join(', ')}</p>}<form className="stack" onSubmit={submit}><div className="filter-row"><label className="field"><span className="field-label">Decision</span><select className="select" value={action} onChange={event => setAction(event.target.value)}><option value="approve">Approve for public display</option><option value="limit">Limit distribution</option><option value="remove">Remove thought</option><option value="ban">Remove and ban actor</option></select></label>{action === 'ban' && <label className="field"><span className="field-label">Ban duration</span><select className="select" value={duration} onChange={event => setDuration(event.target.value)}><option value="24">24 hours</option><option value="168">7 days</option><option value="720">30 days</option><option value="permanent">Permanent</option></select></label>}</div><label className="field"><span className="field-label">Reason for this decision (required)</span><textarea className="textarea" required minLength={3} maxLength={500} rows={2} value={reason} onChange={event => setReason(event.target.value)} placeholder="Record the policy and context behind your decision." /></label>{error && <p className="error-message" role="alert">{error}</p>}<button className="button button-primary" disabled={pending || reason.trim().length < 3} style={{ alignSelf: 'start' }}>{pending ? 'Recording…' : action === 'ban' ? `Confirm ${duration === 'permanent' ? 'permanent' : `${duration}-hour`} ban` : 'Record decision'} <Check size={18} /></button></form></article>;
}

type PolicySection = { title: string; content: ReactNode };
const policies: Record<string, { eyebrow: string; title: string; description: string; sections: PolicySection[] }> = {
  privacy: {
    eyebrow: 'Privacy at Curevo', title: 'Honesty needs a little trust.', description: 'Here’s what Curevo stores, what other people can see, and the choices you have.',
    sections: [
      { title: 'What you choose to share', content: <p>We store the emotion, intensity, cause, thought, intention, visibility, and aggregate preference you submit, along with a timestamp and a private owner identifier. We also store your reactions, account saves, reports, follow-ups, and beta invitations. A guest cookie allows this browser to find your history. Google sign-in adds the account information needed to identify you and keep your data across devices.</p> },
      { title: 'Anonymous in public, private by choice', content: <p>Your name, email, and private identifier do not appear on public thoughts. Public thoughts can be read, searched, linked, and included in share cards by others. Private thoughts do not enter public feeds or social cards. Moderation and authorized operation of the service may require access to submitted content. Avoid including names, contact details, addresses, or identifying stories about yourself or anyone else.</p> },
      { title: 'A choice about the bigger picture', content: <p>You choose whether each check-in contributes to the Pulse. We display grouped breakdowns only when the minimum cohort has been met, currently at least 30 contributors. This reduces the exposure of small groups; it does not turn every dataset into a guarantee of anonymity. Your personal history remains visible to you even when you opt out of public aggregates.</p> },
      { title: 'The services behind Curevo', content: <p>Configured infrastructure providers process data to host the application, store records, authenticate accounts, check content for harmful material, prevent abuse, and deliver live updates. These can include MongoDB, Google, a moderation provider, Ably, Upstash, Cloudflare Turnstile, and Sentry. Optional product analytics record a limited list of feature actions only when you opt in. We do not send thought text or search phrases to product analytics, and we do not enable session replay.</p> },
      { title: 'A boundary around emotional data', content: <p>This version of Curevo does not sell private thoughts, individual emotional profiles, or raw user records. There is no personalized advertising based on what you feel. Sponsored events, when present, are labeled. We do not request precise location. Essential session and security cookies operate the service; optional analytics can be switched off in your data settings.</p> },
      { title: 'Keeping and deleting your data', content: <p>Your saved history remains until you delete it. Use Your data to export your records, remove history, or delete your account. Deletion removes records from the live application; independently shared copies, search engine caches, and infrastructure backup lifecycles may differ. Moderation and security records may be retained to enforce restrictions and investigate abuse. Guest access depends on keeping your browser cookie, so export before clearing browser data.</p> },
      { title: 'Your controls', content: <p>Delete a single thought from Your Curevo, remove a bookmark from Saved, and manage exports, deletion, and analytics from <Link href="/data">Your data</Link>. For questions or a moderation appeal, use the operator contact listed for the deployed service. This notice must be kept current as the service and its configured providers change.</p> },
    ],
  },
  terms: {
    eyebrow: 'Terms of use', title: 'A shared space. A shared understanding.', description: 'The basic agreement for taking part in Curevo.',
    sections: [
      { title: 'Who this space is for', content: <p>Curevo is for adults aged 18 or older. By participating, you confirm you meet that requirement and agree to these terms and our community guidelines. Keep account access and invitation links secure. Do not impersonate another person, bypass bans, automate fake participation, or manipulate counts.</p> },
      { title: 'What Curevo offers', content: <p>Curevo is a place to share feelings and explore what other participants report. It is not therapy, medical treatment, a diagnostic tool, or an emergency response service. Posts express personal experiences and intentions, not instructions or professional advice. The Pulse represents people who chose to participate, not a representative measure of humanity.</p> },
      { title: 'Your content and your permission', content: <p>You keep rights you hold in your contributions. You give Curevo permission to store, process, moderate, and display them as needed for the service and the visibility choices you make. Public content can be shared by other people. Only submit content you have the right to share. Do not expose another person’s private information.</p> },
      { title: 'Moderation and access', content: <p>We may review, limit, remove, or block content or access that violates the community guidelines, threatens safety, or interferes with the service. Automated checks can make mistakes, and human review is not guaranteed to be immediate. Use the reporting controls to flag a concern. Repeated or serious violations may result in a ban.</p> },
      { title: 'Availability and your choices', content: <p>The service may change, experience interruptions, or be discontinued. We do not promise a particular emotional result, audience size, or uninterrupted availability. These terms do not remove rights or remedies that cannot lawfully be excluded. You may stop using Curevo, export your records, and delete your account using Your data.</p> },
      { title: 'External services', content: <p>Links to support organizations and third-party sign-in or sharing services lead to services with their own rules and privacy practices. Any new paid product or materially different use of data will need its own clear terms and choices before it is introduced.</p> },
    ],
  },
  'community-guidelines': {
    eyebrow: 'Our community guidelines', title: 'Every feeling belongs. Every action doesn’t.', description: 'Curevo works when people can be honest without making someone else less safe.',
    sections: [
      { title: 'Speak from your own experience', content: <p>It’s okay to be angry, jealous, confused, or sad. Describe what you feel and what is happening for you. Be truthful about your participation. Don’t invent other people’s experiences, flood the Pulse, or use bots to create the appearance of a crowd.</p> },
      { title: 'Protect the person behind the thought', content: <p>Do not publish names, phone numbers, email addresses, exact locations, identifying handles, or other personal details about yourself or someone else. Anonymous posting is not a promise that every story is impossible to recognize. Use broad descriptions when the details are not necessary.</p> },
      { title: 'No harassment or hate', content: <p>No threats, targeted humiliation, doxxing, hateful attacks, or encouragement of violence. An emotion is welcome; directing abuse at someone is not. Do not use coded language to evade moderation or organize attacks outside Curevo.</p> },
      { title: 'Be careful with vulnerable moments', content: <p>You may describe difficult feelings and ask for support. Do not post instructions, methods, graphic details, or encouragement for suicide, self-harm, eating disorders, or violence. If you or someone else is in immediate danger, seek direct human help. Curevo’s community and moderation tools cannot provide an emergency response.</p> },
      { title: 'Keep the space appropriate', content: <p>No sexual exploitation, sexual content involving minors, explicit sexual content, scams, illegal transactions, or spam. Do not promote a product, recruit people, or collect contact information through emotional posts. This service is for adults only.</p> },
      { title: 'Use the tools that protect your space', content: <p>You can report a thought, hide it, or block its anonymous author. Reports are reviewed against these guidelines; a report is not a guarantee of removal. Moderators may approve, limit, remove, or restrict access. We aim to consider context and make room for honest feelings.</p> },
    ],
  },
};

export function PolicyPage({ policy }: { policy: string }) {
  const page = policies[policy];
  if (!page) return null;
  return <main className="page-shell" style={{ maxWidth: 940 }}><PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} /><p className="muted" style={{ marginBottom: 48 }}>Curevo v1 · Updated October 7, 2026</p><div className="stack" style={{ gap: 40 }}>{page.sections.map(section => <section key={section.title}><h2 className="section-heading">{section.title}</h2><div style={{ lineHeight: 1.85 }}>{section.content}</div></section>)}</div><div className="filter-row" style={{ marginTop: 64 }}><Link href="/data" className="button button-primary">Your data & choices <ArrowRight size={18} /></Link><Link href="/safety" className="button button-secondary">Find human support</Link></div></main>;
}

export function SafetyPage() {
  return <main className="page-shell" style={{ maxWidth: 980 }}><PageHeader eyebrow="A little support, when you need it" title="You deserve someone in your corner." description="Some moments need more than a shared thought. These places can help you connect with a real person." /><div className="notice" style={{ background: '#e8e8d9', padding: 'clamp(24px, 4vw, 40px)' }}><h2>If you are in immediate danger</h2><p>Contact your local emergency service or go to the nearest emergency department. If you can, reach out to someone you trust who can be with you. Curevo is not monitored as an emergency service.</p></div><section style={{ marginTop: 56 }}><h2 className="section-heading">Find support where you are.</h2><div className="stack"><a href="https://findahelpline.com/" className="metric-card" target="_blank" rel="noreferrer"><p className="eyebrow">Around the world</p><h3>Find A Helpline <ArrowRight size={22} style={{ display: 'inline' }} /></h3><p>Find verified emotional support and crisis services by country, including options for phone, text, and chat.</p></a><div className="split-grid"><div className="metric-card"><p className="eyebrow">United States</p><h3>988 Suicide & Crisis Lifeline</h3><p>Call or text 988, or use online chat, for emotional support.</p><div className="filter-row"><a className="button button-secondary" href="tel:988">Call 988</a><a className="link-button" href="https://988lifeline.org/" target="_blank" rel="noreferrer">Visit 988 Lifeline <ArrowRight size={18} /></a></div></div><div className="metric-card"><p className="eyebrow">United Kingdom & Ireland</p><h3>Samaritans</h3><p>Call 116 123 to talk with someone at Samaritans.</p><div className="filter-row"><a className="button button-secondary" href="tel:116123">Call 116 123</a><a className="link-button" href="https://www.samaritans.org/how-we-can-help/contact-samaritan/" target="_blank" rel="noreferrer">Visit Samaritans <ArrowRight size={18} /></a></div></div></div></div></section><section style={{ marginTop: 56 }}><h2 className="section-heading">A note about this space.</h2><p>Curevo helps people express feelings and find shared experiences. It does not diagnose, treat, or replace professional mental health care. Other people’s thoughts and intentions are personal experiences, not advice about what you should do.</p><p>If a thought is upsetting, use its menu to hide it or block its anonymous author. Report content that violates our guidelines. You can always leave the feed and return when it feels right for you.</p><Link href="/community-guidelines" className="link-button">Read our community guidelines <ArrowRight size={18} /></Link></section></main>;
}
