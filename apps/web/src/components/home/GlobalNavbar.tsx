"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCircle,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, type User } from "@/store/authStore";

const publicLinks = [
  { label: "Paths", href: "/#paths" },
  { label: "Approach", href: "/#approach" },
  { label: "Inside", href: "/#inside" },
  { label: "Journal", href: "/blog" },
];

function dashboardFor(role?: User["role"]) {
  if (role === "admin") return "/admin-dashboard";
  return "/dashboard";
}

function initials(name?: string) {
  return name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}

export default function GlobalNavbar() {
  const { user, initialized, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const router = useRouter();
  const menuOpen = menuPath === pathname;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setMenuPath(null);
    await logout();
    router.push("/login");
  };

  const dashboard = dashboardFor(user?.role);
  const dashboardLabel = user?.role === "member" ? "My space" : "Dashboard";
  const isCurrentPage = (href: string) => href === "/blog" && pathname.startsWith("/blog");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b border-border/70 bg-background/90 backdrop-blur-xl transition-shadow md:h-20 ${
        scrolled ? "shadow-[0_12px_30px_-24px_color-mix(in_oklab,var(--foreground)_30%,transparent)]" : ""
      }`}
    >
      <a
        href="#main-content"
        className="absolute left-4 top-2 z-10 -translate-y-20 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Curevo home"
          className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <BrandLogo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/65 p-1 lg:flex" aria-label="Primary navigation">
          {publicLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isCurrentPage(item.href) ? "page" : undefined}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            {!initialized ? (
              <Skeleton className="h-10 w-36" aria-label="Loading account" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-11 gap-3 px-2" aria-label={`Open account menu for ${user.name}`}>
                    <Avatar className="size-8 border border-primary/40">
                      <AvatarImage src={user.profileImage || ""} alt="" />
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="max-w-32 truncate text-sm font-semibold">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <span className="block truncate">{user.name}</span>
                    <span className="block text-xs font-normal capitalize text-muted-foreground">{user.role}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => router.push(dashboard)}>
                    <LayoutDashboard className="size-4" /> {dashboardLabel}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    <UserCircle className="size-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => router.push("/profile")}>
                    <Settings className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={handleLogout}>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost"><Link href="/login">Sign in</Link></Button>
                <Button asChild><Link href="/register">Create account</Link></Button>
              </>
            )}
          </div>

          <Sheet open={menuOpen} onOpenChange={(open) => setMenuPath(open ? pathname : null)}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation menu">
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(92vw,24rem)] overflow-y-auto p-0" aria-describedby="mobile-navigation-description">
              <SheetHeader className="border-b border-border px-5 py-5 text-left">
                <SheetTitle><BrandLogo /></SheetTitle>
                <SheetDescription id="mobile-navigation-description">Explore Curevo and manage your account.</SheetDescription>
              </SheetHeader>

              <nav className="grid gap-1 px-3 py-4" aria-label="Mobile navigation">
                {publicLinks.map((item) => (
                  <Button key={item.href} asChild variant={isCurrentPage(item.href) ? "secondary" : "ghost"} className="h-11 justify-start px-3 text-base">
                    <Link
                      href={item.href}
                      aria-current={isCurrentPage(item.href) ? "page" : undefined}
                      onClick={() => setMenuPath(null)}
                    >
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </nav>

              <div className="border-t border-border px-5 py-5">
                {!initialized ? (
                  <div className="space-y-3" aria-label="Loading account"><Skeleton className="h-5 w-28" /><Skeleton className="h-10 w-full" /></div>
                ) : user ? (
                  <div className="space-y-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar className="size-10"><AvatarImage src={user.profileImage || ""} alt="" /><AvatarFallback>{initials(user.name)}</AvatarFallback></Avatar>
                      <div className="min-w-0"><p className="truncate font-semibold text-foreground">{user.name}</p><p className="text-sm capitalize text-muted-foreground">{user.role}</p></div>
                    </div>
                    <Button asChild variant="outline" className="w-full justify-start"><Link href={dashboard}><LayoutDashboard className="size-4" />{dashboardLabel}</Link></Button>
                    <Button asChild variant="outline" className="w-full justify-start"><Link href="/profile"><UserCircle className="size-4" />Profile and settings</Link></Button>
                    <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}><LogOut className="size-4" />Log out</Button>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
                    <Button asChild><Link href="/register">Create account</Link></Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
