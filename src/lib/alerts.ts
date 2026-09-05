import { prisma } from "./db";
import { isOverdue, isToday, isWithinDays } from "./format";
import type { NotificationType } from "./constants";

// Computes live "notification"-style alerts straight from current data,
// rather than relying on a stale pre-seeded Notification table. This is what
// powers the dashboard warning lists, the notification bell, and per-project
// banners — every alert links back to the record that triggered it.

export type Alert = {
  type: NotificationType;
  message: string;
  projectId?: string;
  projectNumber?: string;
  projectName?: string;
  severity: "red" | "yellow";
  entityId?: string;
};

export async function computeAlerts(): Promise<Alert[]> {
  const alerts: Alert[] = [];

  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["COMPLETED", "ARCHIVED"] } },
    include: {
      materials: true,
      containers: true,
      stages: { include: { assignments: true } },
      scheduleEntries: true,
      invoices: true,
      extraWorks: true,
      tasks: true,
    },
  });

  for (const p of projects) {
    // Project starts tomorrow but has no team assigned
    if (p.plannedStartDate && isWithinDays(p.plannedStartDate, 1)) {
      alerts.push({
        type: "PROJECT_STARTS_TOMORROW",
        message: `Проєкт ${p.number} "${p.name}" починається ${isToday(p.plannedStartDate) ? "сьогодні" : "завтра"}`,
        projectId: p.id,
        projectNumber: p.number,
        projectName: p.name,
        severity: "yellow",
      });
      const hasSchedule = p.scheduleEntries.some((s) => isWithinDays(s.date, 1));
      if (!hasSchedule) {
        alerts.push({
          type: "NO_TEAM_ASSIGNED",
          message: `Немає призначеної команди на старт проєкту ${p.number}`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
        });
      }
    }

    // Materials not ordered / delayed
    for (const m of p.materials) {
      if (m.status === "TO_ORDER" || m.status === "TO_BE_DEFINED") {
        alerts.push({
          type: "MATERIAL_NOT_ORDERED",
          message: `Матеріал "${m.name}" ще не замовлено (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
          entityId: m.id,
        });
      }
      if (m.status === "DELAYED" || (m.expectedDeliveryDate && isOverdue(m.expectedDeliveryDate) && m.status !== "DELIVERED")) {
        alerts.push({
          type: "MATERIAL_DELAYED",
          message: `Доставка "${m.name}" прострочена (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
          entityId: m.id,
        });
      }
    }

    // Containers
    for (const c of p.containers) {
      if (c.status === "TO_ORDER") {
        alerts.push({
          type: "CONTAINER_NOT_ORDERED",
          message: `Контейнер не замовлено (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
          entityId: c.id,
        });
      }
      if (c.permitNeeded && !c.permitExpiry) {
        alerts.push({
          type: "PERMIT_MISSING",
          message: `Немає дозволу на паркувальне місце для контейнера (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "yellow",
          entityId: c.id,
        });
      }
      if (c.status === "FULL" || c.status === "NEEDS_PICKUP") {
        alerts.push({
          type: "CONTAINER_NOT_ORDERED",
          message: `Контейнер заповнено — потрібно замовити забір (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "yellow",
          entityId: c.id,
        });
      }
    }

    // Unpaid / overdue invoices
    for (const inv of p.invoices) {
      if (inv.status === "OVERDUE" || (inv.dueDate && isOverdue(inv.dueDate) && inv.status !== "PAID")) {
        alerts.push({
          type: "INVOICE_UNPAID",
          message: `Фактура ${inv.number} прострочена (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
          entityId: inv.id,
        });
      }
    }

    // Extra works pending confirmation
    for (const ew of p.extraWorks) {
      if (ew.executionStatus === "AWAITING_CLIENT_CONFIRMATION") {
        alerts.push({
          type: "EXTRA_WORK_PENDING",
          message: `Додаткова робота очікує підтвердження клієнта (${p.number})`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "yellow",
          entityId: ew.id,
        });
      }
    }

    // Deadline approaching / delayed
    if (p.plannedEndDate) {
      if (isOverdue(p.plannedEndDate)) {
        alerts.push({
          type: "PROJECT_DELAYED",
          message: `Проєкт ${p.number} затримується — минув плановий термін завершення`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "red",
        });
      } else if (isWithinDays(p.plannedEndDate, 5)) {
        alerts.push({
          type: "DEADLINE_APPROACHING",
          message: `Наближається дата завершення проєкту ${p.number}`,
          projectId: p.id,
          projectNumber: p.number,
          projectName: p.name,
          severity: "yellow",
        });
      }
    }
  }

  // Overdue tasks (project-agnostic)
  const overdueTasks = await prisma.task.findMany({
    where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: new Date() } },
    include: { project: true },
  });
  for (const task of overdueTasks) {
    alerts.push({
      type: "TASK_OVERDUE",
      message: `Завдання "${task.title}" прострочене`,
      projectId: task.projectId ?? undefined,
      projectNumber: task.project?.number,
      projectName: task.project?.name,
      severity: "red",
      entityId: task.id,
    });
  }

  return alerts;
}

export async function getWorkerDoubleBookings(date?: Date) {
  const target = date ?? new Date();
  target.setHours(0, 0, 0, 0);
  const next = new Date(target);
  next.setDate(next.getDate() + 1);

  const entries = await prisma.scheduleEntry.findMany({
    where: { date: { gte: target, lt: next } },
    include: { worker: true, project: true },
  });

  const byWorker = new Map<string, typeof entries>();
  for (const e of entries) {
    const list = byWorker.get(e.workerId) ?? [];
    list.push(e);
    byWorker.set(e.workerId, list);
  }

  const conflicts: { worker: string; entries: typeof entries }[] = [];
  for (const [, list] of byWorker) {
    if (list.length < 2) continue;
    // simple overlap check on HH:MM strings
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].startTime < list[j].endTime && list[j].startTime < list[i].endTime) {
          conflicts.push({ worker: list[i].worker.name, entries: [list[i], list[j]] });
        }
      }
    }
  }
  return conflicts;
}
