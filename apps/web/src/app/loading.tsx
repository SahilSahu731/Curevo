import { BrandLogo } from "@/components/brand/BrandLogo";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 bg-background px-6" role="status" aria-label="Loading page">
      <BrandLogo />
      <div className="w-full max-w-sm space-y-3"><Skeleton className="h-7 w-2/3" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-5/6" /></div>
    </div>
  );
}
