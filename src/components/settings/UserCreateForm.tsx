"use client";

import { useActionState } from "react";
import Disclosure from "@/components/Disclosure";
import { ROLES, ROLE_LABELS, type Locale } from "@/lib/constants";

type ActionResult = { error?: string; success?: boolean } | undefined;

export default function UserCreateForm({ action, locale }: { action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>; locale: Locale }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <Disclosure label="Додати користувача">
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <L label="Ім'я *"><input name="name" required className={inputCls} /></L>
        <L label="Email *"><input name="email" type="email" required className={inputCls} /></L>
        <L label="Роль *">
          <select name="role" required className={inputCls} defaultValue="WORKER">
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r][locale]}</option>)}
          </select>
        </L>
        <L label="Телефон"><input name="phone" className={inputCls} /></L>
        <L label="Пароль (за замовчуванням demo1234)"><input name="password" type="password" className={inputCls} /></L>
        {state?.error && <p className="sm:col-span-2 text-sm text-rose-600">{state.error}</p>}
        {state?.success && <p className="sm:col-span-2 text-sm text-emerald-600">Користувача створено</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {pending ? "Створення..." : "Створити"}
          </button>
        </div>
      </form>
    </Disclosure>
  );
}

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
