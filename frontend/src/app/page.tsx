import React from "react";

import HeroSearch from "@/components/home/HeroSearch";
import PopularSearchSection from "@/components/home/PopularSearchSection";
import StoreIntroSection from "@/components/home/StoreIntroSection";
import TyreCategoriesSection from "@/components/home/TyreCategoriesSection";

export default function page() {
  return (
    <>
      <HeroSearch />
      <PopularSearchSection />
      <TyreCategoriesSection />
      <StoreIntroSection />
    </>
  );
}
