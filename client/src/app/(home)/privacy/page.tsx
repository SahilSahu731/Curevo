import Link from "next/link";

const sections = [
  ["Data we handle", "Accounts may include name, email, password hash or Google account identifier, role, profile image, phone, address, date of birth, gender, and biography. Workflow data may include clinic and clinician listings, license submissions, appointments, symptoms, queue events, video-room identifiers, medical records, diagnoses, prescriptions, notes, attachments, reviews, feedback, and notifications."],
  ["Why it is used", "The prototype uses this data to authenticate accounts, show role-specific workflows, schedule appointments, update queues, connect authorized video-visit participants, display records, review clinician submissions, and respond to in-product feedback. Assessment answers on the health-check page are calculated in the browser and are not submitted to the API."],
  ["Storage and recipients", "Configured infrastructure includes a MongoDB database, Cloudinary for uploaded profile and license files, Google OAuth for optional sign-in, an Express and Socket.IO API configured for Render, and a Next.js client configured for Vercel. Browser video uses WebRTC and Google's public STUN endpoint. Actual production accounts, regions, contracts, backup behavior, and operator access have not been verified."],
  ["Cookies and browser storage", "The API sets an authentication cookie. The client also stores authentication state and appearance preferences in browser storage. No advertising or analytics integration was found in the current code. See the Cookie and Storage Notice for details."],
  ["Retention", "Account and workflow data currently remain until an authorized deletion action is completed; no general automatic retention schedule is implemented. Export and deletion audit records retain a one-way email hash for up to 90 days. Tracked profile/license uploads are deleted with the account, but legacy uploads and provider-hosted backups are not verified, so real data must not be entered."],
  ["Access, export, correction, and deletion", "Signed-in users can correct profile details, download a JSON export, or request permanent account deletion from Profile. Deletion removes linked database records and queue references. Deletion of Cloudinary objects and infrastructure backups is a known unresolved launch blocker."],
  ["Sharing and legal requests", "The prototype does not sell data. Data is exposed only to configured service providers and role-authorized users as needed for a workflow. No approved law-enforcement request or disclosure procedure exists yet; any public release requires a documented validation, minimization, approval, and notification process."],
  ["Security incidents", "No organization-specific breach-notification procedure or incident contact has been approved. The release is therefore review-only. Maintainers must preserve evidence, contain access, assess affected data and jurisdictions, and obtain legal guidance before any required notification."],
  ["Children", "The prototype is restricted to adults aged 18 and older. It does not implement parental consent or workflows for minors."],
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <article className="mx-auto max-w-3xl px-4">
        <h1 className="text-4xl font-bold">Privacy Notice</h1>
        <p className="mt-3 text-muted-foreground">Version 2026-08-03 · Effective 3 August 2026 · Pre-release, not legally approved</p>
        <div className="mt-8 border-l-4 border-amber-500 bg-amber-500/10 p-5 text-sm leading-6">
          The operating entity, target jurisdiction, controller or processor roles, healthcare-regulatory status, complaint contact, and service-provider agreements are not yet approved. Do not use this prototype with real personal or health information.
        </div>
        <div className="mt-12 space-y-10">
          {sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{body}</p></section>)}
          <section>
            <h2 className="text-xl font-semibold">Consent and questions</h2>
            <p className="mt-3 leading-7 text-muted-foreground">Registration records the notice version and acceptance source. Telehealth consent is recorded before camera and microphone access and can be superseded by a later revocation record. A verified privacy and complaint contact is still required before launch. For now, use <Link href="/profile" className="text-primary underline">Profile</Link> for export or deletion and do not submit sensitive information through feedback.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
