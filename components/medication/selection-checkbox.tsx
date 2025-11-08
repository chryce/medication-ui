"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";

export type SelectionCheckboxProps = {
  checked?: boolean;
  indeterminate?: boolean;
  onToggle: () => void;
  label?: string;
};

export function SelectionCheckbox({
  checked,
  indeterminate,
  onToggle,
  label,
}: SelectionCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = Boolean(indeterminate && !checked);
    }
  }, [indeterminate, checked]);

  const iconName = indeterminate
    ? "checkbox-indeterminate"
    : checked
      ? "checkbox-checked"
      : "checkbox";

  return (
    <label className="relative inline-flex h-6 w-6 cursor-pointer items-center justify-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-indigo-500">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <Icon name={iconName} />
    </label>
  );
}
