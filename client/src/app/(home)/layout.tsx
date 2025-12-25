import GlobalNavbar from "@/components/home/GlobalNavbar";
import Footer from "@/components/home/Footer";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-black font-body flex flex-col">
       <GlobalNavbar />
       {/* pt-16 or pt-20 to account for fixed navbar height */}
       <main className="flex-1 pt-16 md:pt-20"> 
          {children}
       </main>
       <Footer />
    </div>
  );
}
