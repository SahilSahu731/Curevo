import Link from "next/link";
import { Baby, Bone, Brain, Eye, Heart, Pill, Stethoscope, Syringe } from "lucide-react";

const categories = [
  { name: "General", icon: Stethoscope, color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  { name: "Cardiology", icon: Heart, color: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  { name: "Neurology", icon: Brain, color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" },
  { name: "Ophthalmology", icon: Eye, color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" },
  { name: "Orthopedics", icon: Bone, color: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  { name: "Pediatrics", icon: Baby, color: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300" },
  { name: "Vaccination", icon: Syringe, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  { name: "Internal medicine", icon: Pill, color: "bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300" },
];

export default function PopularCategories() {
  return (
    <section className="w-full overflow-hidden bg-muted/40 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="mb-7 text-2xl font-bold text-foreground sm:text-3xl">Popular specializations</h2>
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
          {categories.map(({ name, icon: Icon, color }) => (
            <Link
              href={`/doctors?specialization=${encodeURIComponent(name)}`}
              key={name}
              className="flex min-h-32 min-w-0 flex-col items-center justify-center gap-3 rounded-md border border-border bg-card p-3 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
            >
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${color}`}>
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="w-full [overflow-wrap:anywhere] text-sm font-semibold leading-5 text-card-foreground">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
