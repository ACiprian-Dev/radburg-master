import Header from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4">{children}</main>
      <Footer />
    </>
  );
}
