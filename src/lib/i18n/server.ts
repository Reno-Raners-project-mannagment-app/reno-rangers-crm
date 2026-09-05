import { cookies } from "next/headers";
import type { Locale } from "../constants";
import { translate } from "./dictionaries";

const LOCALE_COOKIE = "rr_locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined;
  if (value === "UK" || value === "NL" || value === "EN") return value;
  return "UK";
}

export async function setLocaleCookie(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}

export async function getT() {
  const locale = await getLocale();
  return { locale, t: (key: string) => translate(locale, key) };
}
