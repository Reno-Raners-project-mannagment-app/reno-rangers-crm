"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function Disclosure({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-400"
      >
        <Plus size={15} /> {label}
      </button>
    );
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{label}</span>
        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  );
}
