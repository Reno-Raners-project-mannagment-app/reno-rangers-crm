"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, requireUser } from "./helpers";
import { canManageUsers } from "../permissions";
import { hashPassword } from "../auth";
import type { Role } from "../constants";

async function requireAdmin() {
  const user = await requireUser();
  if (!canManageUsers(user.role as Role)) throw new Error("Недостатньо прав");
  return user;
}

export async function createUserAction(_prev: { error?: string } | undefined, fd: FormData) {
  await requireAdmin();
  const name = str(fd, "name");
  const email = str(fd, "email")?.toLowerCase();
  const role = str(fd, "role");
  if (!name || !email || !role) return { error: "Заповніть обов'язкові поля" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Користувач з таким email вже існує" };

  const passwordHash = await hashPassword(str(fd, "password") || "demo1234");
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      phone: str(fd, "phone"),
      locale: str(fd, "locale") ?? "UK",
    },
  });
  revalidatePath("/settings/users");
  return { success: true };
}

export async function toggleUserActiveAction(userId: string, active: boolean) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/settings/users");
}

export async function updateUserRoleAction(userId: string, role: string) {
  await requireAdmin();
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/settings/users");
}
