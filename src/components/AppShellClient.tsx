"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  Package,
  Trash2,
  ListChecks,
  FilePlus2,
  Wallet,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import type { Locale } from "@/lib/constants";
import { translate } from "@/lib/i18n/dictionaries";
import LocaleSwitcher from "./LocaleSwitcher";
import UserMenu from "./UserMenu";
import NotificationsBell from "./NotificationsBell";
import GlobalSearch from "./GlobalSearch";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/projects": FolderKanban,
  "/planning": CalendarDays,
  "/workers": Users,
  "/materials": Package,
  "/containers": Trash2,
  "/tasks": ListChecks,
  "/extra-works": FilePlus2,
  "/finance": Wallet,
  "/reports": BarChart3,
  "/settings/users": Settings,
};

type NavItem = { href: string; label: string };

export default function AppShellClient({
  navItems,
  name,
  roleLabel,
  locale,
  children,
}: {
  navItems: NavItem[];
  name: string;
  roleLabel: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = (k: string) => translate(locale, k);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">RR</div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t("app.name")}</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => {
          const Icon = ICONS[item.href] ?? FolderKanban;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 text-gray-400">
              <X size={20} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-3 py-2.5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 sm:px-5">
          <button onClick={() => setMobileOpen(true)} className="text-gray-500 md:hidden">
            <Menu size={22} />
          </button>
          <div className="hidden flex-1 sm:block">
            <GlobalSearch placeholder={t("action.search") + "..."} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <NotificationsBell />
            <UserMenu name={name} roleLabel={roleLabel} locale={locale} />
          </div>
        </header>
        <div className="border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-900 sm:hidden">
          <GlobalSearch placeholder={t("action.search") + "..."} />
        </div>
        <main className="flex-1 p-3 sm:p-5">{children}</main>
      </div>
    </div>
  );
}
