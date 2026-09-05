import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { navFor } from "@/lib/permissions";
import { ROLE_LABELS, type Role } from "@/lib/constants";
import AppShellClient from "@/components/AppShellClient";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { t, locale } = await getT();
  const items = navFor(user.role as Role).map((item) => ({ href: item.href, label: t(item.key) }));

  return (
    <AppShellClient
      navItems={items}
      name={user.name}
      roleLabel={ROLE_LABELS[user.role as Role][locale]}
      locale={locale}
    >
      {children}
    </AppShellClient>
  );
}
