"use client";

import { useTransition } from "react";

export default function StatusInlineSelect({
  value,
  options,
  labels,
  action,
}: {
  value: string;
  options: string[];
  labels: Record<string, string>;
  action: (status: string) => Promise<void> | void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => startTransition(() => action(e.target.value))}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {labels[o] ?? o}
        </option>
      ))}
    </select>
  );
}
