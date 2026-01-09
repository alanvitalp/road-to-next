"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavigationTab = {
  title: string;
  href: string;
  match?: string | string[];
};

type NavigationTabsProps = {
  tabs: NavigationTab[];
};

const NavigationTabs = ({ tabs }: NavigationTabsProps) => {
  const pathname = usePathname();

  const isActive = (tab: NavigationTab) => {
    if (tab.match) {
      const matches = Array.isArray(tab.match) ? tab.match : [tab.match];
      return matches.some((match) => pathname.includes(match));
    }
    return pathname === tab.href;
  };

  return (
    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
      {tabs.map((tab) => {
        const active = isActive(tab);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
              active
                ? "bg-background text-foreground shadow-sm"
                : "hover:bg-background/50"
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </div>
  );
};

export { NavigationTabs };
