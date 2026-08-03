import Link from "next/link";

const notes = [
  { title: "Why this prototype is review-only", summary: "A plain-language summary of the temporary feature freeze and the approvals required before launch.", href: "/about" },
  { title: "How local wellness checks work", summary: "The health-check page uses simple browser-side rules. It is educational and is not clinically validated.", href: "/health-check" },
  { title: "What data the prototype handles", summary: "The Privacy Notice lists account, appointment, record, upload, and infrastructure data visible in the codebase.", href: "/privacy" },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <div className="mx-auto max-w-5xl px-4">
        <h1 className="text-4xl font-bold md:text-6xl">Product notes</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Maintainer-written notes about the current prototype. No clinical authorship or editorial review is claimed.</p>
        <div className="mt-12 divide-y divide-border border-y border-border">
          {notes.map((note) => (
            <article key={note.title} className="py-8">
              <h2 className="text-2xl font-semibold"><Link href={note.href} className="hover:text-primary">{note.title}</Link></h2>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{note.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
