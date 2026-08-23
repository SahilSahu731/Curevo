export function BlogCover({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  if (!src) return null;
  return (
    <div className={`overflow-hidden bg-muted ${className}`}>
      {/* CMS image URLs are intentionally rendered unoptimized so editors can use any HTTPS media host. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
    </div>
  );
}
