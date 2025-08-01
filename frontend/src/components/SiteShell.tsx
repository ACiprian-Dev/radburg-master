import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="w-full ">{children}</main>
      <Footer />
    </>
  );
}
