import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { canManageProjects, canViewFinance, isRestrictedToOwnProjects } from "@/lib/permissions";
import { formatDate, formatEUR } from "@/lib/format";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLOR, WORK_TYPES, type Role, type Locale, type ProjectStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import type { Prisma } from "@prisma/client";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t, locale } = await getT();
  const role = user.role as Role;
  const sp = await searchParams;

  const where: Prisma.ProjectWhereInput = {};
  if (sp.status) where.status = sp.status;
  if (sp.workType) where.workType = sp.workType;
  if (sp.pm) where.pmId = sp.pm;
  if (sp.client) where.clientId = sp.client;
  if (sp.hasIssues) where.issues = { some: { status: { in: ["OPEN", "IN_PROGRESS"] } } };
  if (sp.q) {
    where.OR = [
      { number: { contains: sp.q } },
      { name: { contains: sp.q } },
      { address: { contains: sp.q } },
      { client: { name: { contains: sp.q } } },
    ];
  }

  if (isRestrictedToOwnProjects(role)) {
    if (role === "CLIENT") {
      const client = await prisma.client.findUnique({ where: { userId: user.id } });
      where.clientId = client?.id ?? "__none__";
    } else {
      const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
      where.scheduleEntries = worker ? { some: { workerId: worker.id } } : { some: { id: "__none__" } };
    }
  }

  const [projects, pms] = await Promise.all([
    prisma.project.findMany({ where, include: { client: true, pm: true }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({ where: { role: "PROJECT_MANAGER" } }),
  ]);

  const showFinance = canViewFinance(role);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("nav.projects")}</h1>
        {canManageProjects(role) && (
          <Link href="/projects/new" className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            <Plus size={16} /> {t("action.create")}
          </Link>
        )}
      </div>

      <form method="get" className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
        <input name="q" defaultValue={sp.q} placeholder={t("action.search") + "..."} className="min-w-40 flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800" />
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">{t("common.status")}: {t("common.all")}</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>{PROJECT_STATUS_LABELS[s][locale]}</option>
          ))}
        </select>
        <select name="workType" defaultValue={sp.workType ?? ""} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">Вид робіт: {t("common.all")}</option>
          {WORK_TYPES.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <select name="pm" defaultValue={sp.pm ?? ""} className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800">
          <option value="">PM: {t("common.all")}</option>
          {pms.map((pm) => (
            <option key={pm.id} value={pm.id}>{pm.name}</option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-gray-100 dark:text-gray-900">
          {t("action.filter")}
        </button>
        {(sp.q || sp.status || sp.workType || sp.pm || sp.hasIssues) && (
          <Link href="/projects" className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 dark:border-gray-700">
            ✕
          </Link>
        )}
      </form>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400 dark:border-gray-800">
              <th className="px-4 py-3 font-medium">№</th>
              <th className="px-4 py-3 font-medium">{t("common.project")}</th>
              <th className="px-4 py-3 font-medium">{t("common.client")}</th>
              <th className="px-4 py-3 font-medium">PM</th>
              <th className="px-4 py-3 font-medium">{t("common.status")}</th>
              <th className="px-4 py-3 font-medium">Старт</th>
              <th className="px-4 py-3 font-medium">Завершення</th>
              {showFinance && <th className="px-4 py-3 font-medium text-right">{t("common.amount")}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`} className="font-medium text-orange-600 hover:underline dark:text-orange-400">
                    {p.number}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/projects/${p.id}`} className="text-gray-800 hover:underline dark:text-gray-200">
                    {p.name}
                  </Link>
                  <div className="text-xs text-gray-400">{p.address}</div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.client.name}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.pm?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge label={PROJECT_STATUS_LABELS[p.status as ProjectStatus][locale]} color={PROJECT_STATUS_COLOR[p.status as ProjectStatus]} />
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(p.plannedStartDate)}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(p.plannedEndDate)}</td>
                {showFinance && <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-200">{formatEUR(p.contractAmount)}</td>}
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
