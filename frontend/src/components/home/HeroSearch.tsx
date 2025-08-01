"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Card } from "../ui/card";

import TyreSizeSelect from "./TyreSizeSelect";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { buildTyreQuery } from "@/lib/tyreQuery";

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Condition = "NOI" | "SEMI" | "SH";

export default function HeroSearch() {
  const router = useRouter();

  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [diameter, setDiameter] = useState("");
  const [condition, setCondition] = useState<Condition>("NOI");

  // ---- Look‑ups ----------------------------------------------------------
  const { data: widthData = [] } = useSWR<{ width_mm: string }[]>(
    `${baseUrl}/catalog/lookup/tyre-widths`,
    fetcher,
  );

  const { data: heightData = [] } = useSWR<{ height_pct: string }[]>(
    width ? `${baseUrl}/catalog/lookup/tyre-heights?width_mm=${width}` : null,
    fetcher,
  );

  const { data: diameterData = [] } = useSWR<{ rim_diam_in: string }[]>(
    width && height
      ? `${baseUrl}/catalog/lookup/tyre-rim-diameters?width_mm=${width}&height_pct=${height}`
      : null,
    fetcher,
  );

  // ---- Transform raw → UI‑friendly -------------------------------------
  const widths = useMemo(() => widthData.map((w) => w.width_mm), [widthData]);
  const heights = useMemo(
    () => heightData.map((h) => h.height_pct),
    [heightData],
  );
  const diameters = useMemo(
    () => diameterData.map((d) => d.rim_diam_in),
    [diameterData],
  );

  // ---- Handlers ---------------------------------------------------------
  const reset = useCallback(() => {
    setWidth("");
    setHeight("");
    setDiameter("");
    setCondition("NOI");
  }, []);

  const handleSubmit = useCallback(() => {
    const query = buildTyreQuery({ width, height, diameter, condition });

    console.log("Search params:", query);
    router.push(`/anvelope?${query}`);
  }, [width, height, diameter, condition, router]);

  // ---- UI ---------------------------------------------------------------
  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/homepage-background.webp"
        alt="Close‑up of a tyre tread pattern"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-black/40" />

      <Card className="relative z-10 mx-auto my-16 flex max-w-lg flex-col items-center gap-4 p-8">
        {/* Heading */}
        <h1 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
          <Search className="size-6" /> Caută anvelope
        </h1>

        {/* Size selectors */}
        <div className="grid w-full grid-cols-3 gap-3">
          <TyreSizeSelect
            label="Lățime"
            placeholder="Lățime"
            values={widths}
            value={width}
            // loading={widthsLoading}
            onChange={(v) => {
              setWidth(v);
              setHeight("");
              setDiameter("");
            }}
          />
          <TyreSizeSelect
            label="Înălțime"
            placeholder="Înălțime"
            values={heights}
            value={height}
            // loading={heightsLoading}
            // disabled={!width}
            onChange={(v) => {
              setHeight(v);
              setDiameter("");
            }}
          />
          <TyreSizeSelect
            label="Diametru"
            placeholder="Diametru"
            values={diameters}
            value={diameter}
            // loading={diametersLoading}
            // disabled={!width || !height}
            onChange={setDiameter}
          />
        </div>

        <Image
          src="/filtru.webp"
          alt="Diagrame de ajutor pentru filtrul de mărimi"
          width={360}
          height={120}
          className="mx-auto"
        />

        {/* Condition */}
        <RadioGroup
          value={condition}
          onValueChange={(v) => setCondition(v as Condition)}
          className="flex justify-center gap-6"
        >
          {(["NOI", "SEMI", "SH"] as const).map((val) => (
            <label
              key={val}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <RadioGroupItem value={val} className="size-4" />
              {val === "SEMI" ? "Semi Noi" : val}
            </label>
          ))}
        </RadioGroup>

        {/* Primary / Secondary buttons */}
        <Button
          size="lg"
          className="h-10 w-full rounded-full cursor-pointer"
          onClick={handleSubmit}
        >
          Caută anvelope
        </Button>
        <Button
          variant="secondary"
          className="h-10 w-full rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200"
          onClick={reset}
        >
          Resetează filtrul
        </Button>

        <Button
          variant="link"
          className="mt-2 flex items-center gap-2 text-sm"
          asChild
        >
          <Link href="/cauta">
            Vezi toate anvelopele <ArrowRight className="size-4" />
          </Link>
        </Button>
      </Card>
    </section>
  );
}
