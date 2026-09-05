import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/db";
import { canViewFinance } from "@/lib/permissions";
import { formatDate, formatEUR, isOverdue, isToday, isWithinDays, startOfWeek, endOfWeek } from "@/lib/format";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLOR,
  MATERIAL_STATUS_LABELS,
  MATERIAL_STATUS_COLOR,
  CONTAINER_STATUS_LABELS,
  CONTAINER_STATUS_COLOR,
  ROLE_LABELS,
  type Locale,
  type Role,
} from "@/lib/constants";
import { DashboardCard, CardRow } from "@/components/dashboard/DashboardCard";
import { Badge } from "@/components/Badge";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t, locale } = await getT();
  const role = user.role as Role;

  if (role === "WORKER" || role === "SUBCONTRACTOR") {
    return <PersonalDashboard userId={user.id} locale={locale} t={t} />;
  }
  if (role === "CLIENT") {
    return <ClientDashboard userId={user.id} locale={locale} t={t} />;
  }
  return <OpsDashboard locale={locale} t={t} showFinance={canViewFinance(role)} />;
}

// =====================================================================
// OPS DASHBOARD — Owner/Admin, PM, Office Manager, Sales, Accountant
// =====================================================================
async function OpsDashboard({ locale, t, showFinance }: { locale: Locale; t: (k: string) => string; showFinance: boolean }) {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  const activeStatuses = ["IN_PROGRESS"];
  const pendingStartStatuses = ["READY_TO_SCHEDULE", "SCHEDULED"];

  const [
    activeProjects,
    pendingProjects,
    todayEntries,
    weekEntries,
    overdueTasks,
    materialsToOrder,
    materialsDelayed,
    containersAction,
    projectsWithIssues,
    unpaidInvoices,
    pendingExtraWorks,
    upcomingProjects,
  ] = await Promise.all([
    prisma.project.findMany({ where: { status: { in: activeStatuses } }, include: { client: true }, orderBy: { plannedEndDate: "asc" } }),
    prisma.project.findMany({ where: { status: { in: pendingStartStatuses } }, include: { client: true }, orderBy: { plannedStartDate: "asc" } }),
    prisma.scheduleEntry.findMany({ where: { date: { gte: new Date(now.setHours(0, 0, 0, 0)), lt: new Date(now.setHours(24, 0, 0, 0)) } }, include: { worker: true, project: true }, orderBy: { startTime: "asc" } }),
    prisma.scheduleEntry.findMany({ where: { date: { gte: weekStart, lte: weekEnd } }, include: { worker: true, project: true }, orderBy: { date: "asc" } }),
    prisma.task.findMany({ where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: new Date() } }, include: { project: true, assignee: true }, orderBy: { dueDate: "asc" } }),
    prisma.material.findMany({ where: { status: { in: ["TO_ORDER", "TO_BE_DEFINED"] } }, include: { project: true } }),
    prisma.material.findMany({ where: { OR: [{ status: "DELAYED" }, { AND: [{ expectedDeliveryDate: { lt: new Date() } }, { status: { notIn: ["DELIVERED", "CANCELLED", "RETURNED"] } }] }] }, include: { project: true } }),
    prisma.container.findMany({ where: { status: { in: ["TO_ORDER", "FULL", "NEEDS_PICKUP"] } }, include: { project: true } }),
    prisma.project.findMany({ where: { OR: [{ status: "ON_HOLD" }, { issues: { some: { status: { in: ["OPEN", "IN_PROGRESS"] } } } }] }, include: { client: true, issues: { where: { status: { in: ["OPEN", "IN_PROGRESS"] } } } } }),
    prisma.invoice.findMany({ where: { status: { in: ["SENT", "OVERDUE"] } }, include: { project: true }, orderBy: { dueDate: "asc" } }),
    prisma.extraWork.findMany({ where: { executionStatus: "AWAITING_CLIENT_CONFIRMATION" }, include: { project: true } }),
    prisma.project.findMany({ where: { status: { notIn: ["COMPLETED", "ARCHIVED"] } }, include: { client: true } }),
  ]);

  const upcomingDates: { label: string; date: Date; href: string }[] = [];
  for (const p of upcomingProjects) {
    if (p.plannedStartDate && isWithinDays(p.plannedStartDate, 7)) upcomingDates.push({ label: `${p.number} — старт проєкту`, date: p.plannedStartDate, href: `/projects/${p.id}` });
    if (p.plannedEndDate && isWithinDays(p.plannedEndDate, 7)) upcomingDates.push({ label: `${p.number} — плановане завершення`, date: p.plannedEndDate, href: `/projects/${p.id}` });
  }
  upcomingDates.sort((a, b) => a.date.getTime() - b.date.getTime());

  const teamToday = todayEntries;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("dashboard.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiTile label={t("dashboard.activeProjects")} value={activeProjects.length} color="blue" />
        <KpiTile label={t("dashboard.todayWork")} value={todayEntries.length} color="blue" />
        <KpiTile label={t("dashboard.overdueTasks")} value={overdueTasks.length} color="red" />
        {showFinance && <KpiTile label={t("dashboard.unpaidInvoices")} value={unpaidInvoices.length} color="yellow" />}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <DashboardCard title={t("dashboard.activeProjects")} count={activeProjects.length} color="blue" viewAllHref="/projects?status=IN_PROGRESS" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {activeProjects.map((p) => (
            <CardRow key={p.id} href={`/projects/${p.id}`} primary={`${p.number} — ${p.name}`} secondary={p.client.name} badge={<Badge label={PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS][locale]} color={PROJECT_STATUS_COLOR[p.status as keyof typeof PROJECT_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.pendingStart")} count={pendingProjects.length} color="yellow" viewAllHref="/projects?status=SCHEDULED" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {pendingProjects.map((p) => (
            <CardRow key={p.id} href={`/projects/${p.id}`} primary={`${p.number} — ${p.name}`} secondary={p.plannedStartDate ? `Старт: ${formatDate(p.plannedStartDate)}` : undefined} badge={<Badge label={PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS][locale]} color={PROJECT_STATUS_COLOR[p.status as keyof typeof PROJECT_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.todayWork")} count={todayEntries.length} color="blue" viewAllHref="/planning" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {todayEntries.map((e) => (
            <CardRow key={e.id} href={`/projects/${e.projectId}`} primary={`${e.worker.name} — ${e.project.number}`} secondary={`${e.startTime}–${e.endTime} · ${e.task ?? ""}`} badge={<Badge label={e.confirmed ? "OK" : "?"} color={e.confirmed ? "green" : "yellow"} dot={false} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.weekWork")} count={weekEntries.length} color="blue" viewAllHref="/planning" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {weekEntries.slice(0, 8).map((e) => (
            <CardRow key={e.id} href={`/projects/${e.projectId}`} primary={`${formatDate(e.date)} — ${e.worker.name}`} secondary={`${e.project.number} · ${e.startTime}–${e.endTime}`} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.overdueTasks")} count={overdueTasks.length} color="red" viewAllHref="/tasks?filter=overdue" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {overdueTasks.map((task) => (
            <CardRow key={task.id} href={task.projectId ? `/projects/${task.projectId}` : "/tasks"} primary={task.title} secondary={`${task.project?.number ?? ""} · ${t("common.date")}: ${formatDate(task.dueDate)}`} badge={<Badge label={task.priority} color="red" dot={false} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.materialsToOrder")} count={materialsToOrder.length} color="red" viewAllHref="/materials" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {materialsToOrder.map((m) => (
            <CardRow key={m.id} href={`/projects/${m.projectId}?tab=materials`} primary={m.name} secondary={m.project.number} badge={<Badge label={MATERIAL_STATUS_LABELS[m.status as keyof typeof MATERIAL_STATUS_LABELS][locale]} color={MATERIAL_STATUS_COLOR[m.status as keyof typeof MATERIAL_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.deliveriesDelayed")} count={materialsDelayed.length} color="red" viewAllHref="/materials" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {materialsDelayed.map((m) => (
            <CardRow key={m.id} href={`/projects/${m.projectId}?tab=materials`} primary={m.name} secondary={`${m.project.number} · ${m.expectedDeliveryDate ? formatDate(m.expectedDeliveryDate) : ""}`} badge={<Badge label={MATERIAL_STATUS_LABELS[m.status as keyof typeof MATERIAL_STATUS_LABELS][locale]} color={MATERIAL_STATUS_COLOR[m.status as keyof typeof MATERIAL_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.containersAction")} count={containersAction.length} color="yellow" viewAllHref="/containers" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {containersAction.map((c) => (
            <CardRow key={c.id} href={`/projects/${c.projectId}?tab=containers`} primary={`${c.wasteType} (${c.size})`} secondary={c.project.number} badge={<Badge label={CONTAINER_STATUS_LABELS[c.status as keyof typeof CONTAINER_STATUS_LABELS][locale]} color={CONTAINER_STATUS_COLOR[c.status as keyof typeof CONTAINER_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.teamToday")} count={teamToday.length} color="blue" viewAllHref="/workers" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {teamToday.map((e) => (
            <CardRow key={e.id} href={`/workers/${e.workerId}`} primary={e.worker.name} secondary={`${e.project.number} · ${e.startTime}–${e.endTime}`} badge={<Badge label={e.confirmed ? "✓" : "?"} color={e.confirmed ? "green" : "yellow"} dot={false} />} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.projectsWithIssues")} count={projectsWithIssues.length} color="red" viewAllHref="/projects?hasIssues=1" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {projectsWithIssues.map((p) => (
            <CardRow key={p.id} href={`/projects/${p.id}?tab=issues`} primary={`${p.number} — ${p.name}`} secondary={p.status === "ON_HOLD" ? "Заблокований" : `${p.issues.length} відкрит${p.issues.length === 1 ? "а проблема" : "их проблем"}`} badge={<Badge label={PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS][locale]} color={PROJECT_STATUS_COLOR[p.status as keyof typeof PROJECT_STATUS_COLOR]} />} />
          ))}
        </DashboardCard>

        {showFinance && (
          <DashboardCard title={t("dashboard.unpaidInvoices")} count={unpaidInvoices.length} color="yellow" viewAllHref="/finance" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
            {unpaidInvoices.map((inv) => (
              <CardRow key={inv.id} href={`/projects/${inv.projectId}?tab=finance`} primary={`${inv.number} — ${formatEUR(inv.amount)}`} secondary={`${inv.project.number} · ${t("common.date")}: ${formatDate(inv.dueDate)}`} badge={<Badge label={isOverdue(inv.dueDate) ? "OVERDUE" : inv.status} color={isOverdue(inv.dueDate) ? "red" : "yellow"} dot={false} />} />
            ))}
          </DashboardCard>
        )}

        <DashboardCard title={t("dashboard.extraWorksPending")} count={pendingExtraWorks.length} color="yellow" viewAllHref="/extra-works" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {pendingExtraWorks.map((ew) => (
            <CardRow key={ew.id} href={`/projects/${ew.projectId}?tab=extra-works`} primary={ew.description} secondary={`${ew.project.number} · ${formatEUR(ew.laborCost + ew.materialCost)}`} />
          ))}
        </DashboardCard>

        <DashboardCard title={t("dashboard.upcomingDates")} count={upcomingDates.length} color="gray" emptyLabel={t("common.noData")}>
          {upcomingDates.slice(0, 10).map((d, i) => (
            <CardRow key={i} href={d.href} primary={d.label} secondary={formatDate(d.date)} badge={<Badge label={isToday(d.date) ? t("common.today") : ""} color={isToday(d.date) ? "blue" : "gray"} dot={false} />} />
          ))}
        </DashboardCard>
      </div>
    </div>
  );
}

function KpiTile({ label, value, color }: { label: string; value: number; color: "blue" | "red" | "yellow" | "green" }) {
  const colorMap = {
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-rose-600 dark:text-rose-400",
    yellow: "text-amber-600 dark:text-amber-400",
    green: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className={`text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

// =====================================================================
// PERSONAL DASHBOARD — Worker / Subcontractor
// =====================================================================
async function PersonalDashboard({ userId, locale, t }: { userId: string; locale: Locale; t: (k: string) => string }) {
  const worker = await prisma.worker.findUnique({ where: { userId } });
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const [todayEntries, weekEntries, myTasks, recentLogs] = worker
    ? await Promise.all([
        prisma.scheduleEntry.findMany({ where: { workerId: worker.id, date: { gte: new Date(now.setHours(0, 0, 0, 0)), lt: new Date(now.setHours(24, 0, 0, 0)) } }, include: { project: true }, orderBy: { startTime: "asc" } }),
        prisma.scheduleEntry.findMany({ where: { workerId: worker.id, date: { gte: weekStart, lte: weekEnd } }, include: { project: true }, orderBy: { date: "asc" } }),
        prisma.task.findMany({ where: { workerId: worker.id, status: { notIn: ["DONE", "CANCELLED"] } }, include: { project: true }, orderBy: { dueDate: "asc" } }),
        prisma.timeLog.findMany({ where: { workerId: worker.id }, include: { project: true }, orderBy: { date: "desc" }, take: 5 }),
      ])
    : [[], [], [], []];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("dashboard.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(new Date())}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard title={t("dashboard.todayWork")} count={todayEntries.length} color="blue" viewAllHref="/planning" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {todayEntries.map((e) => (
            <CardRow key={e.id} href={`/projects/${e.projectId}`} primary={`${e.project.number} — ${e.project.name}`} secondary={`${e.startTime}–${e.endTime} · ${e.project.address}`} badge={<Badge label={e.confirmed ? "✓" : "?"} color={e.confirmed ? "green" : "yellow"} dot={false} />} />
          ))}
        </DashboardCard>
        <DashboardCard title={t("dashboard.weekWork")} count={weekEntries.length} color="blue" emptyLabel={t("common.noData")}>
          {weekEntries.map((e) => (
            <CardRow key={e.id} href={`/projects/${e.projectId}`} primary={`${formatDate(e.date)} — ${e.project.number}`} secondary={`${e.startTime}–${e.endTime}`} />
          ))}
        </DashboardCard>
        <DashboardCard title={t("nav.tasks")} count={myTasks.length} color="yellow" viewAllHref="/tasks" viewAllLabel={t("action.viewAll")} emptyLabel={t("common.noData")}>
          {myTasks.map((task) => (
            <CardRow key={task.id} href="/tasks" primary={task.title} secondary={task.project?.number} badge={<Badge label={task.priority} color={isOverdue(task.dueDate) ? "red" : "yellow"} dot={false} />} />
          ))}
        </DashboardCard>
        <DashboardCard title="Останні записи годин" count={recentLogs.length} color="gray" emptyLabel={t("common.noData")}>
          {recentLogs.map((log) => (
            <CardRow key={log.id} href={`/projects/${log.projectId}`} primary={`${formatDate(log.date)} — ${log.project.number}`} secondary={`${log.startTime}–${log.endTime}`} />
          ))}
        </DashboardCard>
      </div>
    </div>
  );
}

// =====================================================================
// CLIENT DASHBOARD
// =====================================================================
async function ClientDashboard({ userId, locale, t }: { userId: string; locale: Locale; t: (k: string) => string }) {
  const client = await prisma.client.findUnique({ where: { userId }, include: { projects: { include: { stages: true, extraWorks: true } } } });
  const projects = client?.projects ?? [];
  const pendingExtraWorks = projects.flatMap((p) => p.extraWorks.filter((ew) => ew.executionStatus === "AWAITING_CLIENT_CONFIRMATION").map((ew) => ({ ...ew, projectNumber: p.number, projectId: p.id })));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{t("dashboard.title")}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{ROLE_LABELS.CLIENT[locale]}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DashboardCard title={t("nav.projects")} count={projects.length} color="blue" emptyLabel={t("common.noData")}>
          {projects.map((p) => {
            const done = p.stages.filter((s) => s.status === "DONE" || s.status === "INSPECTED").length;
            const pct = p.stages.length ? Math.round((done / p.stages.length) * 100) : 0;
            return (
              <CardRow key={p.id} href={`/projects/${p.id}`} primary={`${p.number} — ${p.name}`} secondary={`Прогрес: ${pct}%`} badge={<Badge label={PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS][locale]} color={PROJECT_STATUS_COLOR[p.status as keyof typeof PROJECT_STATUS_COLOR]} />} />
            );
          })}
        </DashboardCard>
        <DashboardCard title={t("dashboard.extraWorksPending")} count={pendingExtraWorks.length} color="yellow" emptyLabel={t("common.noData")}>
          {pendingExtraWorks.map((ew) => (
            <CardRow key={ew.id} href={`/projects/${ew.projectId}?tab=extra-works`} primary={ew.description} secondary={`${ew.projectNumber} · ${formatEUR(ew.laborCost + ew.materialCost)}`} />
          ))}
        </DashboardCard>
      </div>
    </div>
  );
}
