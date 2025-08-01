"use client";

import React from "react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";

/* --------------------------------------------------------------------------
  TyreCategoriesSection
  --------------------------------------------------------------------------
  Renders two groups of tyre categories:
  1. Primary categories (Tourism, 4x4, Vans, Trucks) – displayed as large square
     image cards in a responsive 2×2 grid.
  2. Secondary categories (Second‑Hand, Summer, Winter, All‑Seasons) – displayed
     as smaller circular thumbnails with badges.

  HOW TO USE
  • Replace the img `src` values with your own assets or Next.js <Image>.
  • Update the `href` fields when you have the routes ready.
  • To add / remove categories, just edit the arrays.

  DESIGN NOTES / IMPROVEMENTS
  • Added subtle hover‑lift & shadow for better affordance.
  • Heading now has a tiny accent bar underneath (like in the screenshot).
  • Small categories scroll horizontally on mobile if space is tight.
  • Accessible alt text & aria‑labels for better SEO and screen reader support.
  • Placeholder image strings use https://source.unsplash.com – swap later.
-------------------------------------------------------------------------- */

interface Category {
  name: string;
  img: string;
  href: string;
  badge?: string; // emoji or short label overlay for small categories
}

const primaryCategories: Category[] = [
  {
    name: "Anvelope Turisme",
    img: "anvelope-turisme.webp",
    href: "/anvelope-turisme",
  },
  {
    name: "Anvelope 4×4",
    img: "anvelope4x4.webp",
    href: "/anvelope-4x4",
  },
  {
    name: "Anvelope Autoutilitare",
    img: "anvelope-autoutilitare.webp",
    href: "/anvelope-autoutilitare",
  },
  {
    name: "Anvelope Camioane",
    img: "anvelope-camioane.webp",
    href: "/anvelope-camioane",
  },
];

const secondaryCategories: Category[] = [
  {
    name: "Anvelope Second‑Hand",
    img: "anvelope-second.webp",
    href: "/anvelope-second-hand",
    badge: "SH",
  },
  {
    name: "Anvelope Vară",
    img: "anvelope-vara.webp",
    href: "/anvelope-vara",
    badge: "☀️",
  },
  {
    name: "Anvelope Iarnă",
    img: "anvelope-iarna.webp",
    href: "/anvelope-iarna",
    badge: "❄️",
  },
  {
    name: "Anvelope All‑Seasons",
    img: "anvelope-allseason.webp",
    href: "/anvelope-all-seasons",
    badge: "⦿",
  },
];

const TyreCategoriesSection: React.FC = () => {
  return (
    <section className="w-full py-12 space-y-10">
      {/* Heading */}
      <header className="text-center space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-2xl font-semibold"
        >
          Categorii Anvelope
        </motion.h2>
        <span className="block w-8 h-0.5 bg-gray-800 mx-auto" />
      </header>

      {/* Primary categories grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-2 gap-6 px-4 max-w-screen-lg mx-auto">
        {primaryCategories.map((cat) => (
          <a
            key={cat.name}
            href={cat.href}
            aria-label={cat.name}
            className="group"
          >
            <motion.div
              whileHover={{ y: -4, boxShadow: "0 8px 20px rgba(0,0,0,0.15)" }}
              className="rounded-xl overflow-hidden"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <Card className="rounded-none border-0">
                <CardContent className="py-4 text-center text-sm font-medium uppercase tracking-wide">
                  {cat.name}
                </CardContent>
              </Card>
            </motion.div>
          </a>
        ))}
      </div>

      {/* Secondary categories */}
      <div className="px-4 max-w-screen-lg mx-auto">
        <ul className="flex gap-6 overflow-x-auto pb-2 justify-center scrollbar-hide flex-wrap">
          {secondaryCategories.map((cat) => (
            <li key={cat.name} className="flex-shrink-0">
              <a
                href={cat.href}
                aria-label={cat.name}
                className="flex flex-col items-center gap-2"
              >
                <div className="relative">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-48 h-48 xs:w-28 xs:h-28 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
                <span className="text-xs text-center max-w-[7rem] leading-tight">
                  {cat.name}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default TyreCategoriesSection;
