import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/inter';
import './globals.css';
import CurevoProvider from '@/components/curevo-provider';
export const metadata:Metadata={metadataBase:new URL(process.env.BETTER_AUTH_URL||'http://localhost:3000'),title:{default:'Curevo — Humanity, right now.',template:'%s · Curevo'},description:'A place for every feeling. Share what’s on your mind anonymously and discover what real people are feeling, thinking, and about to do.',applicationName:'Curevo',openGraph:{type:'website',siteName:'Curevo',title:'Curevo — Humanity, right now.',description:'Different lives. Familiar feelings. Join the Pulse.'},twitter:{card:'summary_large_image'},appleWebApp:{capable:true,statusBarStyle:'default',title:'Curevo'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f6f4ed'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><CurevoProvider>{children}</CurevoProvider></body></html>;}
