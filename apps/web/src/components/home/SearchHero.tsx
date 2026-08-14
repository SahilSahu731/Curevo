"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SearchHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event?: React.FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("name", searchQuery.trim());
    if (location.trim()) params.set("location", location.trim());
    const destination = params.size ? `/doctors?${params.toString()}` : "/doctors";
    router.push(destination);
  };

  return (
    <section className="relative flex h-[calc(100svh-7rem)] min-h-[460px] max-h-[620px] w-full items-center overflow-hidden bg-slate-950">
      <Image
        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=82&w=2070&auto=format&fit=crop"
        alt="Clinician speaking with a patient"
        fill
        priority
        quality={80}
        sizes="100vw"
        className="object-cover object-[62%_center] sm:object-center"
      />
      <div className="absolute inset-0 bg-slate-950/65 sm:bg-slate-950/55" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8 text-center sm:px-6">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          Find a doctor and request a visit
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-100 sm:text-lg">
          Search demonstration provider listings by specialty and location.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-7 grid w-full max-w-4xl gap-2 rounded-md bg-white p-2 shadow-xl md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_auto]"
          role="search"
          aria-label="Find a doctor"
        >
          <label className="flex min-w-0 items-center gap-3 rounded-sm border border-slate-200 px-3 md:border-0 md:border-r">
            <Search className="size-5 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="sr-only">Doctor name or specialization</span>
            <input
              type="search"
              placeholder="Doctor name or specialization"
              className="h-12 min-w-0 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </label>
          <label className="flex min-w-0 items-center gap-3 rounded-sm border border-slate-200 px-3 md:border-0">
            <MapPin className="size-5 shrink-0 text-slate-500" aria-hidden="true" />
            <span className="sr-only">City or postal code</span>
            <input
              type="search"
              placeholder="City or postal code"
              className="h-12 min-w-0 w-full bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-500"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <Button type="submit" size="lg" className="h-12 bg-emerald-700 px-7 text-base font-semibold text-white hover:bg-emerald-800">
            <Search className="size-4" aria-hidden="true" /> Search
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm font-medium text-slate-100">
          <span className="text-slate-300">Popular:</span>
          {['Dermatology', 'Cardiology', 'Dentistry', 'Neurology', 'Pediatrics'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => router.push(`/doctors?specialization=${encodeURIComponent(tag)}`)}
              className="rounded-full border border-white/50 px-3 py-1.5 transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
