"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { filterParser } from "../search-params";

const TicketFilterTabs = () => {
  const [filter, setFilter] = useQueryState("filter", filterParser);

  const handleValueChange = (value: string) => {
    if (value === "all" || value === "organization") {
      setFilter(value);
    }
  };

  return (
    <Tabs value={filter} onValueChange={handleValueChange}>
      <TabsList className="w-full max-w-[420px]">
        <TabsTrigger value="all" className="flex-1">
          All My Tickets
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex-1">
          Active Organization
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export { TicketFilterTabs };
