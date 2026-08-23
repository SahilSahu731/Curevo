import { Database, Eye, FileDown, KeyRound, ShieldCheck, Trash2 } from "lucide-react";

import { PublicPageCta, PublicPageHero } from "@/components/home/PublicPage";

const sections = [
  { icon: Database, title: "Data we handle", text: "Account data may include your name, email, password hash or Google account identifier, profile image, phone, location, date of birth, and biography. Product data may include focus sessions, routine names and schedules, reflections, notification preferences, feedback, support requests, consent records, sessions, and security audit events." },
  { icon: Eye, title: "Why it is used", text: "Curevo uses this information to authenticate your account, save your personal focus workspace, show your routines and reflections, deliver reminders you enable, protect the service, respond to feedback, and meet account export or deletion requests." },
  { icon: ShieldCheck, title: "Sensitive notes", text: "Reflection text can feel personal even though Curevo is not a medical service. Write only what you are comfortable storing in a prototype. Do not use Curevo for emergency communication or as a health record." },
  { icon: KeyRound, title: "Providers", text: "MongoDB stores application data. Cloudinary may store profile images. Configured email and Google sign-in providers process the information needed for those features. Provider contracts, regions, backups, and production retention remain launch blockers." },
  { icon: FileDown, title: "Access and correction", text: "Signed-in members can update profile details or download a JSON export from Profile. These controls require an authenticated session and are designed to return only the member’s own data." },
  { icon: Trash2, title: "Deletion and retention", text: "Members can request permanent deletion of personal focus data from Profile. Profile-image removal from the active provider is attempted during deletion; deletion from infrastructure backups still requires verified production policy." },
];

export default function PrivacyPage() {
  return (
    <div className="overflow-hidden bg-background text-foreground">
      <PublicPageHero
        eyebrow="Privacy notice · prototype"
        title={<>Your personal space should not feel <span className="font-serif italic font-normal text-[#bd624b] dark:text-[#ef9f88]">mysterious.</span></>}
        description="This interim notice describes the current source code and review environment. It is not final legal approval for public launch."
        aside={
          <>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">The short version</p>
            <p className="mt-5 text-2xl font-semibold leading-tight tracking-tight">Your account data supports your workspace—not advertising or behavioural tracking.</p>
            <p className="mt-5 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">You can update, export, or request deletion of account data from Profile.</p>
          </>
        }
      />

      <section className="px-5 py-20 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What happens to your information</p><h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Plain-language details.</h2></div>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">Six practical areas explain what the current prototype stores and the controls that exist today.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-[#dce9d7] text-[#315c49] dark:bg-emerald-950 dark:text-emerald-200"><Icon className="size-5" aria-hidden="true" /></span><span className="font-mono text-xs font-bold text-muted-foreground">0{index + 1}</span></div>
                <h3 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-4 leading-7 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 rounded-[1.75rem] border border-amber-300/40 bg-amber-100/50 p-6 dark:border-amber-800/40 dark:bg-amber-950/30 sm:flex sm:gap-6 sm:p-8">
            <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-200">PLEASE NOTE</span>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-950/75 dark:text-amber-100/75 sm:mt-0">There is no approved privacy contact or operating entity yet. Do not submit real sensitive information until those details and the deployed infrastructure are verified.</p>
          </div>
        </div>
      </section>

      <PublicPageCta eyebrow="Your account, your controls" title="Need to review or remove what you shared?" description="Open your profile to update details, export account information, or request deletion." primaryHref="/profile" primaryLabel="Open account settings" secondaryHref="/contact" secondaryLabel="Ask a privacy question" />
    </div>
  );
}
