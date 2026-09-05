"use client";

import { useTransition } from "react";
import { updateUserRoleAction } from "@/lib/actions/users";
import { ROLES, ROLE_LABELS, type Locale, type Role } from "@/lib/constants";

export default function RoleSelect({ userId, role, locale }: { userId: string; role: string; locale: Locale }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(e) => startTransition(() => updateUserRoleAction(userId, e.target.value))}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{ROLE_LABELS[r as Role][locale]}</option>
      ))}
    </select>
  );
}
