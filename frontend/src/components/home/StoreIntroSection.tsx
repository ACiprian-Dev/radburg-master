"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/* --------------------------------------------------------------------------
  StoreIntroSection  ⚙️ v2
  --------------------------------------------------------------------------
  • Added <Link> wrappers around key highlighted phrases so users can jump
    straight to the relevant PLP / category pages.
  • All links use semantic, accessible markup and a subtle blue underline
    hover‑state supplied via Tailwind utilities.
  -------------------------------------------------------------------------- */

const StoreIntroSection: React.FC = () => {
  return (
    // <section className="w-full py-14">
    <section className="w-full py-14 bg-primary text-primary-foreground">
      <div className="max-w-screen-md mx-auto px-4 space-y-8">
        {/* Heading */}
        <header className="text-center space-y-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold"
          >
            Anvelope Plus – Magazinul tău de anvelope auto
          </motion.h2>
          <span className="block w-10 h-0.5 bg-gray-800 mx-auto" />
        </header>

        {/* Intro paragraphs */}
        <p className="leading-relaxed">
          Pentru a avea parte de siguranță atunci când conduci un autovehicul
          este necesar ca acesta să fie echipat în mod corespunzător, cu
          anvelopele potrivite. Acestea trebuie să respecte datele tehnice din
          certificatul de înmatriculare și să fie adecvate sezonului în care
          circuli.
        </p>
        <p className="leading-relaxed">
          Cel mai simplu și rapid poți cumpăra online anvelopele necesare, iar
          pentru asta site‑ul nostru,&nbsp;
          <strong>
            <Link
              href="/"
              className=" hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Anvelope&nbsp;Plus
            </Link>
          </strong>
          , îți stă la dispoziție cu o gamă variată de produse. Vei găsi cu
          siguranță ceea ce ai nevoie pentru Turisme, 4×4, Autoutilitare,
          Camioane, Agricole, Industriale, OTR, Motociclete, Motocros și ATV,
          totul fiind bine structurat pe categorii.
        </p>
        <p className="leading-relaxed">
          Pentru fiecare dintre aceste categorii poți alege să cumperi de la
          acest magazin online anvelope de iarnă, de vară sau&nbsp;
          <em>all‑season</em>. În România nu există o dată fixă la care se
          schimbă anvelopele de vară cu cele de iarnă; este însă obligatoriu ca
          șoferii să aibă mașinile echipate corespunzător atunci când circulă pe
          un drum cu zăpadă, gheață sau polei.
        </p>

        {/* Category types list */}
        <h3 className="text-xl font-semibold pt-4">
          Tipurile de anvelope disponibile:
        </h3>
        <ul className="list-disc list-inside space-y-3 pl-2">
          <li>
            <strong>
              <Link href="/anvelope-noi" className=" hover:underline">
                Anvelope noi
              </Link>
            </strong>{" "}
            – împărțite pe 3 categorii: <em>STANDARD</em>, <em>PREMIUM</em> și
            <em> PREMIUM+</em>, de la cei mai consacrați producători cu renume
            mondial.
          </li>
          <li>
            <strong>
              <Link href="/anvelope-eco" className="lg:hover:underline">
                Anvelope ECO noi reconstruite
              </Link>
            </strong>{" "}
            – produse din materie primă <em>PREMIUM+</em>, cu o aderență cu 30%
            mai mare și o durabilitate cu 50% mai bună față de anvelopele
            integral noi STANDARD, datorită materialelor de cea mai înaltă
            calitate folosite în procesul de producție.
          </li>
          <li>
            <strong>
              <Link href="/anvelope-resapate" className=" hover:underline">
                Anvelope reșapate
              </Link>
            </strong>{" "}
            – împărțite pe 3 categorii: <em>STANDARD</em>, <em>PREMIUM</em> și
            <em> PREMIUM+</em>. Oferă aceeași durabilitate ca anvelopele
            integral noi și aduc minimum 50% economii la prețul / km, datorită
            carcasei metalice intacte folosite în procesul de producție.
          </li>
          <li>
            <strong>
              <Link href="/anvelope-semi-noi" className=" hover:underline">
                Anvelope semi‑noi
              </Link>
            </strong>{" "}
            – o variantă bună pentru cei care parcurg
            35.000–70.000&nbsp;km/sezon, în funcție de dimensiune și categorie
            (PREMIUM+, PREMIUM sau STANDARD).
          </li>
          <li>
            <strong>
              <Link href="/anvelope-second-hand" className=" hover:underline">
                Anvelope second‑hand
              </Link>
            </strong>{" "}
            – potrivite celor care parcurg 10.000–35.000&nbsp;km/sezon și vor
            economii semnificative. Fiecare anvelopă este verificată cu
            tehnologie de ultimă generație înainte de a fi pusă în vânzare.
          </li>
        </ul>

        <p className="leading-relaxed">
          Promovăm produsele pe criteriul calitate–preț, nu pe baza reclamelor
          sau a mărcii. Conform specialiștilor, anvelopele second‑hand de iarnă
          trebuie să aibă minimum 4&nbsp;mm profil, iar sub această valoare sunt
          recomandate pentru celelalte sezoane sau chiar pe timp de vară.
        </p>

        {/* Advantages list */}
        <h3 className="text-xl font-semibold pt-4">
          De ce merită să alegi Anvelope Plus:
        </h3>
        <ul className="list-disc list-inside space-y-3 pl-2">
          <li>
            Găsești anvelope pentru{" "}
            <strong>
              Turisme, 4×4, Autoutilitare, Camioane, Agricole, Industriale, OTR,
              Motociclete, Motocros și ATV
            </strong>
            .
          </li>
          <li>
            Poți alege anvelope{" "}
            <strong>
              Noi (Premium+, Premium, Standard), ECO, Reșapate, Semi‑noi
            </strong>{" "}
            sau <strong>SH</strong>.
          </li>
          <li>
            Disponibile variante <strong>Iarnă</strong>, <strong>Vară</strong>{" "}
            și <strong>All‑Season</strong>.
          </li>
          <li>Promoții recurente la toate categoriile de produse.</li>
          <li>Livrare rapidă în 2‑3 zile lucrătoare.</li>
          <li>
            Branduri consacrate precum Michelin, Bridgestone, Goodyear,
            Continental, Pirelli, Dunlop, Fulda, Hankook, Semperit, Toyo,
            Yokohama, Uniroyal, Nokian, Vredestein, Kumho, Point&nbsp;S,
            Kormoran, Riken, Sava, Tigar, Matador, Barum, Taurus, Aeolus,
            BFGoodrich, Dayton, Double&nbsp;Coin, Trenza etc. — toate cu{" "}
            <strong>garanție 2&nbsp;ani</strong>.
          </li>
          <li>
            Produsele <strong>ECO</strong> vin cu{" "}
            <strong>garanție 3&nbsp;ani</strong> și asigurare{" "}
            <strong>CASCO</strong> pentru milimetrii de profil rămași
            neconsumați.
          </li>
          <li>
            La{" "}
            <strong>
              <Link href="/" className=" hover:underline">
                Anvelope&nbsp;Plus
              </Link>
            </strong>{" "}
            găsești mereu o gamă variată de produse de calitate, la prețuri
            optime.
          </li>
        </ul>
      </div>
    </section>
  );
};

export default StoreIntroSection;
