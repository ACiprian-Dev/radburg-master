import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface FooterMenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

const contactLinks: FooterMenuItem = {
  title: "Contact",
  links: [
    { text: "Luni-Vineri între orele 08:00 - 22:00", url: "/contact" },
    { text: "0799.852.852", url: "tel:+0799852852" },
    { text: "vanzari@anvelopeplus.ro", url: "mailto:vanzari@anvelopeplus.ro" },
    { text: "office@anvelopeplus.ro", url: "mailto:office@anvelopeplus.ro" },
  ],
};

const servicesLinks: FooterMenuItem = {
  title: "Servicii Clienți",
  links: [{ text: "14 zile drept de retur", url: "/" }],
};

const supportLinks: FooterMenuItem = {
  title: "Suport Clienti",
  links: [
    { text: "Contact", url: "/contact" },
    { text: "Urmărește comanda", url: "/urmareste-comanda" },
    { text: "Cerere garanție", url: "/cerere-garantie" },
    { text: "Formular returnare produs", url: "/cerere-retur" },
    { text: "Trimite o reclamație", url: "/reclamatie" },
  ],
};
const companyLinks: FooterMenuItem = {
  title: "Politrans SRL",
  links: [
    { text: "Despre noi", url: "/despre-noi" },
    { text: "Despre Anvelopele ECO", url: "/despre-anvelopele-eco" },
    { text: "Blog", url: "/blog" },
    { text: "Termeni și condiții", url: "/termeni-si-conditii" },
    { text: "Politica returnare si rambursare", url: "/politica-retur" },
    { text: "Politica de livrare", url: "/politica-livrare" },
    {
      text: "Politica de confidențialitate",
      url: "/politica-confidentialitate",
    },
    { text: "Termeni și condiții", url: "/termeni-si-conditii" },
  ],
};

const FOOTERLINKS: FooterMenuItem[] = [
  contactLinks,
  servicesLinks,
  supportLinks,
  companyLinks,
];

const categories: MenuItem[] = [
  { title: "Anvelope Turisme", url: "/anvelope-turisme" },
  { title: "Anvelope 4x4", url: "/anvelope-4x4" },
  { title: "Anvelope OFF-ROAD", url: "/anvelope-off-road" },
  { title: "Anvelope Autoutilitare", url: "/anvelope-autoutilitare" },
  { title: "Anvelope Camioane", url: "/anvelope-camioane" },
  { title: "Anvelope Agricole", url: "/anvelope-agricole" },
  { title: "Anvelope Industriale", url: "/anvelope-industriale" },
  { title: "Anvelope OTR", url: "/anvelope-otr" },
  { title: "Anvelope ATV", url: "/anvelope-atv" },
  { title: "Anvelope Motociclete", url: "/anvelope-motociclete" },
  { title: "Anvelope Noi", url: "/anvelope-noi" },
  { title: "Anvelope Eco", url: "/anvelope-eco" },
  { title: "Anvelope Resapate", url: "/anvelope-resapate" },
  { title: "Anvelope Semi Noi", url: "/anvelope-semi-noi" },
  { title: "Anvelope Second Hand", url: "/anvelope-second-hand" },
];

const seasons: MenuItem[] = [
  { title: "Anvelope Vara", url: "/anvelope-vara" },
  { title: "Anvelope Iarna", url: "/anvelope-iarna" },
  { title: "Anvelope All Season", url: "/anvelope-all-season" },
];

const otherLinks: MenuItem[] = [
  { title: "Reduceri", url: "/anvelope-ieftine" },
  { title: "Blog", url: "/blog" },
  { title: "Contact", url: "/contact" },
  { title: "Cautam Statii Partenere", url: "/cautam-statii-partenere" },
  { title: "Devino Partener", url: "/devino-partener" },
];

const NAVLINKS = [
  { title: "CATEGORII", url: "#", items: categories },
  { title: "SEZOANE", url: "#", items: seasons },
  ...otherLinks,
];

export { categories, seasons, otherLinks, NAVLINKS, FOOTERLINKS };
export type { MenuItem };
