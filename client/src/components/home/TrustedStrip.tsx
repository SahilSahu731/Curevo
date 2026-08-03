import { AlertTriangle } from "lucide-react";

export default function TrustedStrip() {
  return (
    <section className="border-b border-amber-300/50 bg-amber-50 py-4 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
      <div className="container mx-auto flex items-start justify-center gap-3 px-4 text-sm leading-6">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p><strong>Review environment:</strong> use synthetic information only. Workflows and provider listings have not been approved for patient care.</p>
      </div>
    </section>
  );
}
