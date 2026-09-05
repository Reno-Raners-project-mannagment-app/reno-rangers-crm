"use server";

import { revalidatePath } from "next/cache";
import { setLocaleCookie } from "../i18n/server";
import type { Locale } from "../constants";

export async function changeLocaleAction(locale: Locale) {
  await setLocaleCookie(locale);
  revalidatePath("/", "layout");
}
