import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import { canManageProjects, canViewFinance, canManageInvoicesExpenses, canConfirmExtraWorkManually, isRestrictedToOwnProjects } from "@/lib/permissions";
import type { Role } from "@/lib/constants";

import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectTabs, { type ProjectTab } from "@/components/project/ProjectTabs";
import StatusHistoryTab from "@/components/project/StatusHistoryTab";
import PlanningTab from "@/components/project/PlanningTab";
import TeamTab from "@/components/project/TeamTab";
import MaterialsTab from "@/components/project/MaterialsTab";
import ContainersTab from "@/components/project/ContainersTab";
import ProjectTasksTab from "@/components/project/ProjectTasksTab";
import FinanceTab from "@/components/project/FinanceTab";
import ExtraWorksTab from "@/components/project/ExtraWorksTab";
import IssuesTab from "@/components/project/IssuesTab";
import DocumentsTab from "@/components/project/DocumentsTab";
import DailyReportsTab from "@/components/project/DailyReportsTab";
import HandoverTab from "@/components/project/HandoverTab";

export default async function ProjectDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = user.role as Role;
  const { id } = await params;
  const sp = await searchParams;
  const { locale } = await getT();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: true,
      pm: true,
      consultant: true,
      statusHistory: { include: { changedBy: true } },
      stages: { include: { responsible: true, assignments: { include: { worker: true } }, dependsOn: true }, orderBy: { order: "asc" } },
      materials: { include: { supplier: true } },
      containers: { include: { supplier: true } },
      tasks: { include: { assignee: true, project: true } },
      expenses: true,
      invoices: true,
      extraWorks: { include: { approvedBy: true } },
      issues: { include: { responsible: true } },
      documents: { include: { uploadedBy: true } },
      dailyReports: { include: { author: true } },
      scheduleEntries: { include: { worker: true, stage: true, responsible: true }, orderBy: { date: "asc" } },
      timeLogs: { include: { worker: true }, orderBy: { date: "desc" } },
      handover: true,
    },
  });

  if (!project) notFound();

  // Access control for restricted roles
  if (isRestrictedToOwnProjects(role)) {
    if (role === "CLIENT") {
      const client = await prisma.client.findUnique({ where: { userId: user.id } });
      if (client?.id !== project.clientId) notFound();
    } else {
      const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
      const assigned = worker && project.scheduleEntries.some((e) => e.workerId === worker.id);
      if (!assigned) notFound();
    }
  }

  const showFinance = canViewFinance(role);
  const canEdit = canManageProjects(role);
  const canEditFinance = canManageInvoicesExpenses(role) || role === "OWNER_ADMIN";
  const canApproveManually = canConfirmExtraWorkManually(role);

  const [users, workers, suppliers] = await Promise.all([
    prisma.user.findMany({ where: { active: true } }),
    prisma.worker.findMany({ where: { active: true } }),
    prisma.supplier.findMany(),
  ]);

  const tab = sp.tab ?? "overview";
  const view = sp.view ?? "list";

  const tabs: ProjectTab[] = [
    { key: "overview", label: "Огляд" },
    { key: "planning", label: "Планування" },
    { key: "team", label: "Команда" },
    { key: "materials", label: "Матеріали" },
    { key: "containers", label: "Контейнери" },
    { key: "tasks", label: "Завдання" },
    { key: "finance", label: "Фінанси", hidden: !showFinance },
    { key: "extra-works", label: "Додаткові роботи" },
    { key: "issues", label: "Проблеми" },
    { key: "documents", label: "Документи" },
    { key: "daily-reports", label: "Щоденні звіти" },
    { key: "handover", label: "Здача проєкту" },
  ];

  return (
    <div className="space-y-4">
      <ProjectHeader project={project} locale={locale} showFinance={showFinance} />
      <ProjectTabs projectId={project.id} tabs={tabs} active={tab} />

      <div className="pt-2">
        {tab === "overview" && (
          <StatusHistoryTab projectId={project.id} currentStatus={project.status} history={project.statusHistory} locale={locale} role={role} />
        )}
        {tab === "planning" && (
          <PlanningTab
            projectId={project.id}
            stages={project.stages}
            view={view}
            locale={locale}
            responsibleOptions={users.map((u) => ({ id: u.id, name: u.name }))}
            workerOptions={workers.map((w) => ({ id: w.id, name: w.name }))}
            canEdit={canEdit}
          />
        )}
        {tab === "team" && (
          <TeamTab projectId={project.id} entries={project.scheduleEntries} timeLogs={project.timeLogs} workers={workers} stages={project.stages} canEdit={canEdit} />
        )}
        {tab === "materials" && <MaterialsTab projectId={project.id} materials={project.materials} suppliers={suppliers} locale={locale} canEdit={canEdit} />}
        {tab === "containers" && <ContainersTab projectId={project.id} containers={project.containers} suppliers={suppliers} locale={locale} canEdit={canEdit} />}
        {tab === "tasks" && (
          <ProjectTasksTab
            projectId={project.id}
            tasks={project.tasks}
            users={users.map((u) => ({ id: u.id, name: u.name }))}
            materials={project.materials.map((m) => ({ id: m.id, name: m.name }))}
            containers={project.containers.map((c) => ({ id: c.id, name: `${c.wasteType} (${c.size})` }))}
            workers={workers.map((w) => ({ id: w.id, name: w.name }))}
            locale={locale}
          />
        )}
        {tab === "finance" && showFinance && <FinanceTab project={project} expenses={project.expenses} invoices={project.invoices} extraWorks={project.extraWorks} locale={locale} canEdit={canEditFinance} />}
        {tab === "extra-works" && <ExtraWorksTab projectId={project.id} extraWorks={project.extraWorks} locale={locale} canEdit={canEdit} canApproveManually={canApproveManually} />}
        {tab === "issues" && <IssuesTab projectId={project.id} issues={project.issues} responsibleOptions={users.map((u) => ({ id: u.id, name: u.name }))} locale={locale} canEdit={canEdit} />}
        {tab === "documents" && <DocumentsTab projectId={project.id} documents={project.documents} locale={locale} canEdit={canEdit} />}
        {tab === "daily-reports" && <DailyReportsTab projectId={project.id} reports={project.dailyReports} canEdit={true} />}
        {tab === "handover" && <HandoverTab projectId={project.id} checklist={project.handover} canEdit={canEdit} />}
      </div>
    </div>
  );
}
