"use client";

import * as React from "react";
import Link from "next/link";

import { categories, seasons, otherLinks } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export default function DesktopNav() {
  return (
    <div className="hidden lg:flex h-full items-center">
      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>CATEGORII</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                {categories.map((item) => (
                  <ListItem key={item.url} title={item.title} href={item.url} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>SEZOANE</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[200px] gap-4">
                {seasons.map((item) => (
                  <ListItem key={item.url} title={item.title} href={item.url} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {otherLinks.map((item) => (
            <NavigationMenuItem key={item.url}>
              <NavigationMenuLink asChild>
                <Link href={item.url}>
                  <div className="text-sm leading-none font-medium">
                    {item.title}
                  </div>
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
