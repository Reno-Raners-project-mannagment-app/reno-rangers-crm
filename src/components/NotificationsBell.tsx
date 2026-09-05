"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { Alert } from "@/lib/alerts";

export default function NotificationsBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => setAlerts(d.alerts ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const redCount = alerts.filter((a) => a.severity === "red").length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Bell size={18} />
        {alerts.length > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
              redCount > 0 ? "bg-rose-500" : "bg-amber-500"
            }`}
          >
            {alerts.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 max-h-96 w-80 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-900">
          {alerts.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-gray-400">Немає активних сповіщень</p>
          ) : (
            alerts.slice(0, 25).map((a, i) => (
              <Link
                key={i}
                href={a.projectId ? `/projects/${a.projectId}` : "#"}
                onClick={() => setOpen(false)}
                className="block border-b border-gray-100 px-3 py-2 text-sm last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              >
                <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${a.severity === "red" ? "bg-rose-500" : "bg-amber-500"}`} />
                <span className="text-gray-700 dark:text-gray-300">{a.message}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
