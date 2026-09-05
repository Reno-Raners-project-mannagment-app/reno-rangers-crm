import Link from "next/link";
import type { StatusColor } from "@/lib/constants";
import { STATUS_DOT_CLASSES } from "@/lib/constants";

export function DashboardCard({
  title,
  count,
  color = "gray",
  viewAllHref,
  viewAllLabel,
  emptyLabel,
  children,
}: {
  title: string;
  count: number;
  color?: StatusColor;
  viewAllHref?: string;
  viewAllLabel?: string;
  emptyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASSES[color]}`} />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {count}
          </span>
        </div>
        {viewAllHref && count > 0 && (
          <Link href={viewAllHref} className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400">
            {viewAllLabel}
          </Link>
        )}
      </div>
      <div className="flex-1 divide-y divide-gray-100 dark:divide-gray-800">
        {count === 0 ? <p className="px-4 py-6 text-center text-sm text-gray-400">{emptyLabel}</p> : children}
      </div>
    </div>
  );
}

export function CardRow({ href, primary, secondary, badge }: { href: string; primary: string; secondary?: string; badge?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/60">
      <span className="min-w-0">
        <span className="block truncate font-medium text-gray-800 dark:text-gray-100">{primary}</span>
        {secondary && <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{secondary}</span>}
      </span>
      {badge && <span className="shrink-0">{badge}</span>}
    </Link>
  );
}
