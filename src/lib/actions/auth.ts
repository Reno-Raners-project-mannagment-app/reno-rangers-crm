"use server";

import { redirect } from "next/navigation";
import { prisma } from "../db";
import { createSession, destroySession, verifyPassword } from "../auth";
import type { Role, Locale } from "../constants";

export async function loginAction(_prevState: { error?: string } | undefined, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "login.error" };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "login.error" };
  }

  await createSession({
    userId: user.id,
    role: user.role as Role,
    name: user.name,
    locale: user.locale as Locale,
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
