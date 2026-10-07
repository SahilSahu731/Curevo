'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { Pulse } from '@/lib/types';
import { emotions, emotionBySlug } from '@/lib/taxonomy';
export default function PulseChart({pulse,compact=false}:{pulse:Pulse;compact?:boolean}){
 const rows=pulse.emotions.length?pulse.emotions:emotions.slice(0,6).map(e=>({emotion:e.slug,count:0,percentage:0}));
 return <div className={`pulse-chart ${compact?'compact':''}`} aria-label="Emotion distribution over the past 24 hours">{[...rows].sort((a,b)=>b.count-a.count).slice(0,compact?6:22).map(row=>{const e=emotionBySlug(row.emotion);return <Link href={`/emotion/${e.slug}`} className="pulse-row" key={row.emotion}><span className="pulse-emotion"><span style={{color:e.color}} aria-hidden="true">{e.symbol}</span>{e.name}</span><div className="pulse-track"><span style={{width:`${Math.max(0,Math.min(100,row.percentage))}%`,background:e.color}}/></div><span className="pulse-value">{pulse.sufficientData?`${Math.round(row.percentage)}%`:'—'}</span><ArrowUpRight size={17}/></Link>;})}{!pulse.sufficientData&&<p className="cohort-note">Percentages appear after {pulse.cohortMinimum||30} people contribute. Every feeling counts; small groups stay private.</p>}</div>;
}
