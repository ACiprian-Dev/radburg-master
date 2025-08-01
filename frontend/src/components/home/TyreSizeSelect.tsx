"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  label: string;
  placeholder: string;
  values: string[]; // e.g. ['155', '165', '175', ...]
  onChange?: (v: string) => void;
  value?: string; // current selected value
}

export default function TyreSizeSelect({
  label,
  placeholder,
  values,
  onChange,
  value,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span className="sr-only">{label}</span>
      <Select onValueChange={onChange} value={value} disabled={!values.length}>
        <SelectTrigger className="w-full rounded-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {values.map((v) => (
            <SelectItem key={v} value={v}>
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
