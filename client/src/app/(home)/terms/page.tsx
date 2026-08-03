export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <article className="mx-auto max-w-3xl px-4">
        <h1 className="text-4xl font-bold">Prototype Terms</h1>
        <p className="mt-3 text-muted-foreground">Version 2026-08-03 · Effective 3 August 2026 · Pre-release, not legally approved</p>
        <div className="mt-8 border-l-4 border-amber-500 bg-amber-500/10 p-5 text-sm leading-6">No operating entity, launch jurisdiction, customer contract, clinical sponsor, or governing law has been selected. These terms are a product-accurate interim notice, not final legal approval.</div>
        <div className="mt-12 space-y-10 leading-7 text-muted-foreground">
          <section><h2 className="text-xl font-semibold text-foreground">Permitted use</h2><p className="mt-3">Use the service only to evaluate the prototype with synthetic information. You must be at least 18, control the account you use, and must not upload another person&apos;s information, clinician credentials, malicious files, or unlawful content.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">No medical or emergency service</h2><p className="mt-3">The software does not provide medical advice, diagnosis, clinical triage, treatment, prescriptions, emergency response, or a guarantee that a listed clinician, clinic, time, queue position, or video visit is available or suitable. For urgent symptoms or danger, contact the emergency service for your location immediately.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Provider and record limitations</h2><p className="mt-3">Listings and seed records may be synthetic. A verification status only reflects an internal prototype workflow and is not a credentialing decision. Users must independently verify providers and care arrangements outside this prototype.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Accounts and acceptable use</h2><p className="mt-3">Keep credentials confidential. Do not bypass access controls, manipulate queues or reviews, probe other accounts or rooms, overload the service, scrape sensitive data, or use the software for clinical decisions.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Availability and changes</h2><p className="mt-3">The prototype may be suspended, reset, changed, or withdrawn without notice. Data may be lost. Production writes are disabled by default while governance review is incomplete.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Privacy and consent</h2><p className="mt-3">The Privacy Notice describes current code behavior and unresolved risks. Registration records acceptance of the current Terms and Privacy Notice. Video visits require a separate pre-join acknowledgement.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Complaints and disputes</h2><p className="mt-3">A verified legal contact, complaint process, jurisdiction, governing law, liability allocation, and dispute process remain launch blockers. Do not publicly release or contract on this draft.</p></section>
        </div>
      </article>
    </main>
  );
}
