import Link from "next/link";
import { SearchX } from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-lg text-center">
        <BrandLogo className="justify-center" />
        <SearchX className="mx-auto mt-10 size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The address may be incorrect, or this workflow may no longer be available.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild><Link href="/">Go home</Link></Button>
          <Button asChild variant="outline"><Link href="/blog">Browse the journal</Link></Button>
        </div>
      </section>
    </main>
  );
}
