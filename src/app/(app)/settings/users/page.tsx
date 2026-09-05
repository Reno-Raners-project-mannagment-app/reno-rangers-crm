import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { canManageUsers } from "@/lib/permissions";
import type { Role } from "@/lib/constants";
import { createUserAction, toggleUserActiveAction } from "@/lib/actions/users";
import UserCreateForm from "@/components/settings/UserCreateForm";
import RoleSelect from "@/components/settings/RoleSelect";

export default async function UsersSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canManageUsers(user.role as Role)) redirect("/dashboard");
  const { locale } = await getT();

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Користувачі</h1>

      <UserCreateForm action={createUserAction} locale={locale} />

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
              <th className="px-3 py-2.5">Ім&apos;я</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Роль</th>
              <th className="px-3 py-2.5">Статус</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{u.name}</td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{u.email}</td>
                <td className="px-3 py-2.5">
                  <RoleSelect userId={u.id} role={u.role} locale={locale} />
                </td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${u.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                    {u.active ? "Активний" : "Неактивний"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <form action={toggleUserActiveAction.bind(null, u.id, !u.active)}>
                    <button className="text-xs font-medium text-gray-500 hover:text-orange-600">
                      {u.active ? "Деактивувати" : "Активувати"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
