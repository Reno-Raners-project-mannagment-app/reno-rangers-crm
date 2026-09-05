import { getT } from "@/lib/i18n/server";
import LoginForm from "@/components/LoginForm";
import { ROLE_LABELS } from "@/lib/constants";

const DEMO_ACCOUNTS: { email: string; role: keyof typeof ROLE_LABELS }[] = [
  { email: "admin@renorangers.nl", role: "OWNER_ADMIN" },
  { email: "pm@renorangers.nl", role: "PROJECT_MANAGER" },
  { email: "office@renorangers.nl", role: "OFFICE_MANAGER" },
  { email: "sales@renorangers.nl", role: "SALES" },
  { email: "accountant@renorangers.nl", role: "ACCOUNTANT" },
  { email: "worker@renorangers.nl", role: "WORKER" },
  { email: "sub@renorangers.nl", role: "SUBCONTRACTOR" },
  { email: "client@renorangers.nl", role: "CLIENT" },
];

export default async function LoginPage() {
  const { locale } = await getT();
  const demoAccounts = DEMO_ACCOUNTS.map((a) => ({ email: a.email, label: ROLE_LABELS[a.role][locale] }));

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <LoginForm locale={locale} demoAccounts={demoAccounts} />
    </main>
  );
}
