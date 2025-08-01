"use client";

import React from "react";
import { Truck, CreditCard, ShieldCheck, LifeBuoy } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "../ui/button";

import { Card, CardContent } from "@/components/ui/card";

/**
 * PopularSearchSection
 *
 * Displays:
 * 1. A horizontal list of the tyre sizes users search most often.
 * 2. Four value‑prop banners (free delivery, instalments, warranty, casco insurance).
 * 3. A placeholder carousel that will be replaced with real ProductCards once the PLP & ProductCard component are ready.
 *
 * NOTE:
 * – The carousel currently renders <ProductPlaceholder /> elements. Replace the mapping logic with your <ProductCard> later.
 * – TailwindCSS is used for styling. Icons are from lucide‑react and motion effects from framer‑motion.
 */

const sizes = [
  { id: 1, name: "Anvelope 205/55 R16", href: "/anvelope/205-55-r16" },
  { id: 2, name: "Anvelope 195/65 R15", href: "/anvelope/195-65-r15" },
  { id: 3, name: "Anvelope 185/65 R15", href: "/anvelope/185-65-r15" },
  { id: 4, name: "Anvelope 225/45 R17", href: "/anvelope/225-45-r17" },
  { id: 5, name: "Anvelope 225/50 R17", href: "/anvelope/225-50-r17" },
  { id: 6, name: "Anvelope 235/45 R17", href: "/anvelope/235-45-r17" },
];

const banners = [
  {
    icon: Truck,
    label: "Livrare gratuită",
  },
  {
    icon: CreditCard,
    label: "Plată în rate",
  },
  {
    icon: ShieldCheck,
    label: "2 ani Garanție · 3 ani pt ECO",
  },
  {
    icon: LifeBuoy,
    label: "Asigurare CASCO la service partener",
  },
];

/** Placeholder card until real ProductCard is plugged in */
const ProductPlaceholder: React.FC = () => (
  <Card className="w-40 sm:w-48 md:w-56 lg:w-60 xl:w-64 h-72 flex flex-col items-center justify-center gap-2 border-dashed border-2 border-gray-300">
    <span className="text-sm text-gray-400">Product Card</span>
    <span className="text-xs text-gray-300">coming soon</span>
  </Card>
);

const PopularSearchSection: React.FC = () => {
  return (
    <section className="w-full space-y-8 py-10">
      {/* Heading */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="text-center text-2xl font-semibold"
      >
        Clienții noștri caută cel mai des:
      </motion.h2>
      {/* <h2 className="text-center text-2xl font-semibold">
        Clienții noștri caută cel mai des:
      </h2> */}

      {/* Most searched tyre sizes */}
      <ul className="flex flex-wrap justify-center overflow-x-auto gap-4 px-4 md:justify-center scrollbar-hide">
        {sizes.map((size) => (
          <li key={size.id} className="flex-shrink-0">
            <Button
              variant={"outline"}
              className="whitespace-nowrap rounded-full border border-gray-200 px-4 py-2 text-sm hover:bg-gray-100 active:bg-gray-200 cursor-pointer"
              asChild
            >
              <Link href={size.href} className="hover:underline">
                {size.name}
              </Link>
            </Button>
          </li>
        ))}
      </ul>

      {/* Value‑prop banners */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4">
        {banners.map(({ icon: Icon, label }) => (
          <Card
            key={label}
            className="bg-gray-800 text-white h-20 flex items-center justify-center"
          >
            <CardContent className="flex items-center gap-2 p-2">
              <Icon className="w-5 h-5" />
              <span className="text-xs sm:text-sm md:text-base text-center leading-snug">
                {label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carousel placeholder */}
      {/* Replace the placeholders with your real carousel implementation (Swiper/Splide etc.) once ProductCard is ready */}
      <div className="w-full overflow-x-auto px-4">
        <div className="flex gap-4 pb-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductPlaceholder key={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularSearchSection;
