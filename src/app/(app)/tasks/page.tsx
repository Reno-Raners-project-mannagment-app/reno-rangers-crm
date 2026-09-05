import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getT } from "@/lib/i18n/server";
import TaskForm from "@/components/tasks/TaskForm";
import TaskCard from "@/components/tasks/TaskCard";
import Link from "next/link";
import { isRestrictedToOwnProjects } from "@/lib/permissions";
import type { Role } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { locale } = await getT();
  const role = user.role as Role;
  const sp = await searchParams;

  const where: Prisma.TaskWhereInput = {};
  if (sp.filter === "overdue") {
    where.status = { notIn: ["DONE", "CANCELLED"] };
    where.dueDate = { lt: new Date() };
  } else if (sp.filter === "open") {
    where.status = { notIn: ["DONE", "CANCELLED"] };
  } else if (sp.filter === "mine") {
    where.assigneeId = user.id;
  }

  if (isRestrictedToOwnProjects(role) && role !== "CLIENT") {
    const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
    where.OR = [{ assigneeId: user.id }, { workerId: worker?.id ?? "__none__" }];
  }

  const [tasks, projects, users, materials, containers, workers] = await Promise.all([
    prisma.task.findMany({ where, include: { assignee: true, project: true }, orderBy: [{ status: "asc" }, { dueDate: "asc" }] }),
    prisma.project.findMany({ where: { status: { notIn: ["COMPLETED", "ARCHIVED"] } } }),
    prisma.user.findMany({ where: { active: true } }),
    prisma.material.findMany({ include: { project: true } }),
    prisma.container.findMany({ include: { project: true } }),
    prisma.worker.findMany({ where: { active: true } }),
  ]);

  const filters = [
    { key: undefined, label: "Усі" },
    { key: "open", label: "Активні" },
    { key: "overdue", label: "Прострочені" },
    { key: "mine", label: "Мої" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Завдання</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={f.key ? `/tasks?filter=${f.key}` : "/tasks"}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${sp.filter === f.key ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <TaskForm
        locale={locale}
        projects={projects.map((p) => ({ id: p.id, name: `${p.number} — ${p.name}` }))}
        users={users.map((u) => ({ id: u.id, name: u.name }))}
        materials={materials.map((m) => ({ id: m.id, name: `${m.name} (${m.project.number})` }))}
        containers={containers.map((c) => ({ id: c.id, name: `${c.wasteType} (${c.project.number})` }))}
        workers={workers.map((w) => ({ id: w.id, name: w.name }))}
      />

      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} locale={locale} />
        ))}
        {tasks.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Немає завдань</p>}
      </div>
    </div>
  );
}
