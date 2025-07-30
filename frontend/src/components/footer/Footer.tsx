import Link from "next/link";

import { FOOTERLINKS } from "@/lib/utils";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface Footer2Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

const Footer = ({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/block-1.svg",
    alt: "blocks for shadcn/ui",
    title: "Shadcnblocks.com",
    url: "https://www.shadcnblocks.com",
  },
  // tagline = "Components made easy.",
  menuItems = FOOTERLINKS,
  copyright = "Copyright © 2025 POLITRANS SRL , CUI: 15840480, Reg. Com. J33/952/2003, SLOBOZIA SUCEVEI, Jud. SUCEAVA",
  bottomLinks = [
    { text: "Terms and Conditions", url: "#" },
    { text: "Privacy Policy", url: "#" },
  ],
}: Footer2Props) => {
  return (
    <section className="pt-8 lg:pt-32 mt-auto">
      <div>
        <footer>
          <div className="mb-8 lg:mb-16 px-32">
            <div className="flex items-center gap-2 lg:justify-start">
              <Link href="/">
                <img
                  src={"/logo_black.png"}
                  className="max-h-8"
                  alt={logo.alt}
                  width={192}
                  height={192}
                />
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 px-8 lg:px-32">
            {menuItems.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 font-bold">{section.title}</h3>
                <ul className="text-muted-foreground space-y-4">
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className="hover:text-primary font-medium"
                    >
                      <a href={link.url}>{link.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-24 flex flex-col justify-between gap-4 border-t py-8 px-8 text-sm font-medium md:flex-row md:items-center">
            <p>{copyright}</p>
            <ul className="flex gap-4">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-primary underline">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
};

export { Footer };
