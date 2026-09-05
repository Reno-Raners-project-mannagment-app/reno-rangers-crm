"use client";

import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { initials } from "@/lib/format";
import { translate } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/constants";

export default function UserMenu({ name, roleLabel, locale }: { name: string; roleLabel: string; locale: Locale }) {
  const t = (k: string) => translate(locale, k);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
          {initials(name)}
        </span>
        <span className="hidden sm:block">
          <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{name}</span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">{roleLabel}</span>
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          <form action={logoutAction}>
            <button type="submit" className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
              {t("action.logout")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
