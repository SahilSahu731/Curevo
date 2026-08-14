export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background pb-24 pt-32 text-foreground">
      <article className="mx-auto max-w-3xl px-4">
        <h1 className="text-4xl font-bold">Cookie and Storage Notice</h1>
        <p className="mt-3 text-muted-foreground">Version 2026-08-03 · Effective 3 August 2026</p>
        <div className="mt-12 space-y-10 leading-7 text-muted-foreground">
          <section><h2 className="text-xl font-semibold text-foreground">Authentication cookie</h2><p className="mt-3">The Express API sets an opaque <code>curevo_session</code> cookie after sign-in. It is HttpOnly, so browser JavaScript cannot read it. The server stores only a hash of the session value, applies an account-session expiry, and revokes it when you sign out.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Browser storage</h2><p className="mt-3">The client uses local storage for authentication state and the selected appearance theme. Assessment answers remain only in React page memory unless a user downloads a PDF. Browser storage remains until it is cleared, overwritten, or removed during sign-out where implemented.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">What is not configured</h2><p className="mt-3">No advertising, behavioral tracking, payment, or analytics integration was found in the current source. The Google OAuth flow and externally hosted page images may still cause requests to their respective providers.</p></section>
          <section><h2 className="text-xl font-semibold text-foreground">Controls</h2><p className="mt-3">You can sign out and clear site cookies or storage through browser settings. Blocking the authentication cookie prevents signed-in workflows. A consent-management banner is not provided because no optional cookie category is currently implemented.</p></section>
        </div>
      </article>
    </main>
  );
}
