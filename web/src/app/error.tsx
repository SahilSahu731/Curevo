'use client';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <section className="page-shell empty-state"><span className="empty-symbol">〰</span><h1>A little interruption.</h1><p>We couldn’t load this part of Curevo. Please try again.</p><button className="button button-dark" onClick={reset}>Try again</button></section>;}
