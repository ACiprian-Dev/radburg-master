import "@/styles/globals.css";
import { Geist } from "next/font/google";

import SiteShell from "@/components/SiteShell";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "Anvelope Plus – magazinul tău de anvelope",
  description: "Caută, compară și comandă online anvelope auto.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={geist.variable}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
