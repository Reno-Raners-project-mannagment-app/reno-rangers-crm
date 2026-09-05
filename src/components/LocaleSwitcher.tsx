"use client";

import { useTransition } from "react";
import { changeLocaleAction } from "@/lib/actions/locale";
import type { Locale } from "@/lib/constants";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "UK", label: "UA" },
  { value: "NL", label: "NL" },
  { value: "EN", label: "EN" },
];

export default function LocaleSwitcher({ current }: { current: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5 text-xs dark:border-gray-800 dark:bg-gray-900">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          disabled={pending}
          onClick={() => startTransition(() => changeLocaleAction(opt.value))}
          className={`rounded-md px-2 py-1 font-medium transition ${
            current === opt.value
              ? "bg-orange-500 text-white"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
