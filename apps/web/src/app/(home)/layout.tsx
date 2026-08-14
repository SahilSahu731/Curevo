import GlobalNavbar from "@/components/home/GlobalNavbar";
import Footer from "@/components/home/Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background font-body text-foreground">
      <GlobalNavbar />
      <main id="main-content" className="flex-1 pt-16 md:pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
