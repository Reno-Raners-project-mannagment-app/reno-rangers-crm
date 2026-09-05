import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { canManageProjects, canConfirmExtraWorkManually, isRestrictedToOwnProjects } from "@/lib/permissions";
import ExtraWorksTab from "@/components/project/ExtraWorksTab";
import type { Role } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function ExtraWorksPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { locale } = await getT();
  const role = user.role as Role;

  const where: Prisma.ExtraWorkWhereInput = {};
  if (role === "CLIENT") {
    const client = await prisma.client.findUnique({ where: { userId: user.id } });
    where.project = { clientId: client?.id ?? "__none__" };
  } else if (isRestrictedToOwnProjects(role)) {
    const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
    where.project = { scheduleEntries: { some: { workerId: worker?.id ?? "__none__" } } };
  }

  const extraWorks = await prisma.extraWork.findMany({ where, include: { approvedBy: true, project: true }, orderBy: { createdAt: "desc" } });
  const byProject = new Map<string, typeof extraWorks>();
  for (const ew of extraWorks) {
    const list = byProject.get(ew.projectId) ?? [];
    list.push(ew);
    byProject.set(ew.projectId, list);
  }

  const canEdit = canManageProjects(role) || role === "SALES";
  const canApproveManually = canConfirmExtraWorkManually(role);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Додаткові роботи</h1>

      {[...byProject.entries()].map(([projectId, items]) => (
        <div key={projectId}>
          <Link href={`/projects/${projectId}?tab=extra-works`} className="mb-2 inline-block text-sm font-semibold text-gray-800 hover:text-orange-600 dark:text-gray-100">
            {items[0].project.number} — {items[0].project.name}
          </Link>
          <ExtraWorksTab projectId={projectId} extraWorks={items} locale={locale} canEdit={canEdit} canApproveManually={canApproveManually} />
        </div>
      ))}

      {extraWorks.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Додаткових робіт ще немає</p>}
    </div>
  );
}
