import { getCurrentUser } from "../auth";

export function str(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  if (v === null) return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
}

export function num(fd: FormData, key: string): number | undefined {
  const s = str(fd, key);
  if (s === undefined) return undefined;
  const n = Number(s);
  return Number.isNaN(n) ? undefined : n;
}

export function dateOrNull(fd: FormData, key: string): Date | null {
  const s = str(fd, key);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}
