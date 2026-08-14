const terms = [
  ["Prototype status", "Curevo is a review-only prototype for self-guided focus, habits, and everyday wellbeing. No operating entity, launch jurisdiction, customer contract, or governing law has been approved."],
  ["Permitted use", "Use the service only with information you control and, while launch remains blocked, only synthetic information. You must be at least 18 and must not upload another person's data, malicious files, unlawful content, or credentials you do not own."],
  ["No medical or emergency service", "Curevo does not provide medical advice, diagnosis, treatment, therapy, clinical triage, prescriptions, or emergency response. If you may be in immediate danger, contact the emergency service for your location and do not wait for this website."],
  ["Accounts and acceptable use", "Keep your credentials confidential. Do not bypass access controls, probe other accounts, scrape private content, overload the service, or use its output to make medical or safety-critical decisions."],
  ["Your content", "You remain responsible for routine names, reflections, feedback, and profile information you submit. Avoid content you would not place in a prototype environment."],
  ["Availability and changes", "Features may change, pause, or be removed during review. No uptime, outcome, productivity, or wellbeing guarantee is made."],
];

export default function TermsPage() {
  return <main className="min-h-screen bg-background pb-24 pt-32 text-foreground"><article className="mx-auto max-w-4xl px-5"><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Terms · interim prototype notice</p><h1 className="mt-4 text-5xl font-semibold tracking-[-0.05em] sm:text-7xl">Use Curevo with clear expectations.</h1><p className="mt-6 text-lg leading-8 text-muted-foreground">These terms describe the current review build. They are not final launch terms or a substitute for jurisdiction-specific legal review.</p><div className="mt-12 space-y-4">{terms.map(([title, text], index) => <section key={title} className="rounded-3xl border bg-card p-6 sm:p-8"><p className="text-xs font-bold text-primary">0{index + 1}</p><h2 className="mt-3 text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></section>)}</div></article></main>;
}
