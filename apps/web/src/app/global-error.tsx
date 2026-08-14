"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#ffffff", color: "#172033", fontFamily: "Arial, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <section style={{ maxWidth: 520, textAlign: "center" }} role="alert">
            <h1 style={{ fontSize: 30, marginBottom: 12 }}>Curevo could not start</h1>
            <p style={{ color: "#526079", lineHeight: 1.6 }}>A required part of the application did not load. Try again; no successful action will be repeated automatically.</p>
            <button onClick={reset} style={{ marginTop: 20, border: 0, borderRadius: 6, padding: "12px 18px", background: "#047857", color: "white", fontWeight: 700, cursor: "pointer" }}>Try again</button>
          </section>
        </main>
      </body>
    </html>
  );
}
