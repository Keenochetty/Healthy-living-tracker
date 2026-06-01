"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      <Input defaultValue={defaultValue} name={name} placeholder={placeholder} required={required} type={type} />
    </Label>
  );
}

export function TextareaField({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      <Textarea name={name} placeholder={placeholder} />
    </Label>
  );
}

export function SelectField({
  label,
  name,
  placeholder,
  options,
  required
}: {
  label: string;
  name: string;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
}) {
  return (
    <Label className="grid gap-2">
      <span>{label}</span>
      <Select name={name} required={required}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Label>
  );
}
