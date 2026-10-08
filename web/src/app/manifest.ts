import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Curevo — Humanity, right now.', short_name: 'Curevo',
    description: 'A shared portrait of what real people are feeling. Add your feeling, find a little understanding.',
    start_url: '/', scope: '/', display: 'standalone', orientation: 'portrait-primary',
    background_color: '#f5f2eb', theme_color: '#f5f2eb',
    icons: [
      { src: '/icons/curevo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/curevo-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/icons/curevo-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/curevo-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
