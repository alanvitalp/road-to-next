"use client";

import { useQueryState } from "nuqs";
import { sortParser } from "@/features/ticket/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type Option = {
  value: string;
  label: string;
};

type SortSelectProps = {
  defaultValue?: string;
  options: Option[];
};

const SortSelect = ({ options }: SortSelectProps) => {
  const [sort, setSort] = useQueryState("sort", sortParser)

  const handleSort = (value: string) => {
    setSort(value);
  };

  return (
    <Select
      onValueChange={handleSort}
      defaultValue={sort}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { SortSelect };