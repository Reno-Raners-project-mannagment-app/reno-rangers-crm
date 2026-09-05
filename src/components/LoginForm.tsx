"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { translate } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/constants";

type Props = {
  locale: Locale;
  demoAccounts: { email: string; label: string }[];
};

export default function LoginForm({ locale, demoAccounts }: Props) {
  const t = (key: string) => translate(locale, key);
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-xl font-bold text-white">
          RR
        </div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("login.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("login.subtitle")}</p>
      </div>

      <form action={formAction} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("login.email")}</label>
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@renorangers.nl"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("login.password")}</label>
          <input
            name="password"
            type="password"
            required
            defaultValue="demo1234"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">{t(state.error)}</p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
        >
          {pending ? t("common.loading") : t("action.login")}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t("login.demoAccounts")}</p>
        <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
          {demoAccounts.map((acc) => (
            <li key={acc.email} className="flex justify-between gap-2">
              <span>{acc.label}</span>
              <code className="text-gray-400">{acc.email}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
