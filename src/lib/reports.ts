import { prisma } from "./db";
import { formatDate, isOverdue, startOfWeek, endOfWeek } from "./format";
import {
  PROJECT_STATUS_LABELS,
  MATERIAL_STATUS_LABELS,
  CONTAINER_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  ISSUE_STATUS_LABELS,
  ISSUE_PRIORITY_LABELS,
  EXTRA_WORK_EXECUTION_LABELS,
  type Locale,
  type ProjectStatus,
  type MaterialStatus,
  type ContainerStatus,
  type TaskPriority,
  type IssueStatus,
  type IssuePriority,
  type ExtraWorkExecutionStatus,
} from "./constants";

export type ReportTable = { title: string; columns: string[]; rows: (string | number)[][] };

export const REPORT_TYPES = [
  { key: "daily-plan", label: "Щоденний план робіт" },
  { key: "weekly-plan", label: "Тижневий план робіт" },
  { key: "team-workload", label: "План зайнятості команд" },
  { key: "project-progress", label: "Звіт про прогрес проєктів" },
  { key: "expenses", label: "Звіт про витрати" },
  { key: "profitability", label: "Звіт про прибутковість" },
  { key: "hours", label: "Звіт про відпрацьовані години" },
  { key: "materials", label: "Звіт про матеріали та доставки" },
  { key: "containers", label: "Звіт про контейнери" },
  { key: "overdue-tasks", label: "Прострочені завдання" },
  { key: "issues", label: "Список проблем" },
  { key: "extra-works", label: "Список додаткових робіт" },
  { key: "unpaid-invoices", label: "Неоплачені фактури" },
  { key: "schedule-variance", label: "План vs факт (строки)" },
] as const;

export type ReportKey = (typeof REPORT_TYPES)[number]["key"];

export async function buildReport(key: ReportKey, locale: Locale): Promise<ReportTable> {
  switch (key) {
    case "daily-plan": {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const entries = await prisma.scheduleEntry.findMany({ where: { date: { gte: today, lt: tomorrow } }, include: { worker: true, project: true }, orderBy: { startTime: "asc" } });
      return {
        title: `Щоденний план робіт — ${formatDate(today)}`,
        columns: ["Час", "Працівник", "Проєкт", "Адреса", "Завдання", "Підтверджено"],
        rows: entries.map((e) => [`${e.startTime}-${e.endTime}`, e.worker.name, e.project.number, e.project.address, e.task ?? "", e.confirmed ? "Так" : "Ні"]),
      };
    }
    case "weekly-plan": {
      const monday = startOfWeek(new Date());
      const sunday = endOfWeek(new Date());
      const entries = await prisma.scheduleEntry.findMany({ where: { date: { gte: monday, lte: sunday } }, include: { worker: true, project: true }, orderBy: [{ date: "asc" }, { startTime: "asc" }] });
      return {
        title: `Тижневий план робіт — ${formatDate(monday)} - ${formatDate(sunday)}`,
        columns: ["Дата", "Час", "Працівник", "Проєкт", "Завдання"],
        rows: entries.map((e) => [formatDate(e.date), `${e.startTime}-${e.endTime}`, e.worker.name, e.project.number, e.task ?? ""]),
      };
    }
    case "team-workload": {
      const workers = await prisma.worker.findMany({ where: { active: true }, include: { scheduleEntries: { where: { date: { gte: new Date() } } } } });
      return {
        title: "План зайнятості команд",
        columns: ["Ім'я", "Тип", "Професія", "Заплановано змін"],
        rows: workers.map((w) => [w.name, w.type, w.profession, w.scheduleEntries.length]),
      };
    }
    case "project-progress": {
      const projects = await prisma.project.findMany({ include: { stages: true, client: true } });
      return {
        title: "Звіт про прогрес проєктів",
        columns: ["№", "Назва", "Клієнт", "Статус", "Етапів всього", "Виконано", "Прогрес %"],
        rows: projects.map((p) => {
          const done = p.stages.filter((s) => s.status === "DONE" || s.status === "INSPECTED").length;
          const pct = p.stages.length ? Math.round((done / p.stages.length) * 100) : 0;
          return [p.number, p.name, p.client.name, PROJECT_STATUS_LABELS[p.status as ProjectStatus][locale], p.stages.length, done, pct];
        }),
      };
    }
    case "expenses": {
      const expenses = await prisma.expense.findMany({ include: { project: true }, orderBy: { date: "desc" } });
      return {
        title: "Звіт про витрати",
        columns: ["Дата", "Проєкт", "Категорія", "Опис", "Сума (€)", "Статус"],
        rows: expenses.map((e) => [formatDate(e.date), e.project.number, e.category, e.description, e.amount.toFixed(2), e.status]),
      };
    }
    case "profitability": {
      const projects = await prisma.project.findMany({ include: { expenses: true, extraWorks: true, invoices: true } });
      return {
        title: "Звіт про прибутковість",
        columns: ["№", "Назва", "Договір (€)", "Дод. роботи (€)", "Витрати (€)", "Прогноз прибутку (€)", "Оплачено (€)"],
        rows: projects.map((p) => {
          const extra = p.extraWorks.filter((e) => e.clientConfirmed || e.approvedManually).reduce((s, e) => s + e.laborCost + e.materialCost, 0);
          const exp = p.expenses.reduce((s, e) => s + e.amount, 0);
          const paid = p.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
          return [p.number, p.name, p.contractAmount.toFixed(2), extra.toFixed(2), exp.toFixed(2), (p.contractAmount + extra - exp).toFixed(2), paid.toFixed(2)];
        }),
      };
    }
    case "hours": {
      const logs = await prisma.timeLog.findMany({ include: { worker: true, project: true }, orderBy: { date: "desc" } });
      return {
        title: "Звіт про відпрацьовані години",
        columns: ["Дата", "Працівник", "Проєкт", "Початок", "Кінець", "Перерва (хв)", "Виконана робота"],
        rows: logs.map((l) => [formatDate(l.date), l.worker.name, l.project.number, l.startTime, l.endTime, l.breakMinutes, l.workDone ?? ""]),
      };
    }
    case "materials": {
      const materials = await prisma.material.findMany({ include: { project: true, supplier: true } });
      return {
        title: "Звіт про матеріали та доставки",
        columns: ["Проєкт", "Матеріал", "К-сть", "Постачальник", "Дата замовлення", "Дата доставки", "Статус"],
        rows: materials.map((m) => [m.project.number, m.name, `${m.quantity} ${m.unit}`, m.supplier?.name ?? "", formatDate(m.actualOrderDate ?? m.plannedOrderDate), formatDate(m.actualDeliveryDate ?? m.expectedDeliveryDate), MATERIAL_STATUS_LABELS[m.status as MaterialStatus][locale]]),
      };
    }
    case "containers": {
      const containers = await prisma.container.findMany({ include: { project: true, supplier: true } });
      return {
        title: "Звіт про контейнери",
        columns: ["Проєкт", "Тип відходів", "Розмір", "Постачальник", "Доставка", "Забір", "Статус"],
        rows: containers.map((c) => [c.project.number, c.wasteType, c.size, c.supplier?.name ?? "", formatDate(c.actualDeliveryDate ?? c.plannedDeliveryDate), formatDate(c.actualPickupDate ?? c.plannedPickupDate), CONTAINER_STATUS_LABELS[c.status as ContainerStatus][locale]]),
      };
    }
    case "overdue-tasks": {
      const tasks = await prisma.task.findMany({ where: { status: { notIn: ["DONE", "CANCELLED"] }, dueDate: { lt: new Date() } }, include: { project: true, assignee: true } });
      return {
        title: "Прострочені завдання",
        columns: ["Назва", "Проєкт", "Відповідальний", "Термін", "Пріоритет"],
        rows: tasks.map((t) => [t.title, t.project?.number ?? "", t.assignee?.name ?? "", formatDate(t.dueDate), TASK_PRIORITY_LABELS[t.priority as TaskPriority][locale]]),
      };
    }
    case "issues": {
      const issues = await prisma.issue.findMany({ include: { project: true, responsible: true } });
      return {
        title: "Список проблем",
        columns: ["Проєкт", "Опис", "Пріоритет", "Відповідальний", "Статус", "Вплив на бюджет (€)"],
        rows: issues.map((i) => [i.project.number, i.description, ISSUE_PRIORITY_LABELS[i.priority as IssuePriority][locale], i.responsible?.name ?? "", ISSUE_STATUS_LABELS[i.status as IssueStatus][locale], (i.financialImpact ?? 0).toFixed(2)]),
      };
    }
    case "extra-works": {
      const items = await prisma.extraWork.findMany({ include: { project: true } });
      return {
        title: "Список додаткових робіт",
        columns: ["Проєкт", "Опис", "Робота (€)", "Матеріали (€)", "Підтверджено клієнтом", "Статус виконання"],
        rows: items.map((e) => [e.project.number, e.description, e.laborCost.toFixed(2), e.materialCost.toFixed(2), e.clientConfirmed ? "Так" : "Ні", EXTRA_WORK_EXECUTION_LABELS[e.executionStatus as ExtraWorkExecutionStatus][locale]]),
      };
    }
    case "unpaid-invoices": {
      const invoices = await prisma.invoice.findMany({ where: { status: { not: "PAID" } }, include: { project: true } });
      return {
        title: "Неоплачені фактури",
        columns: ["№ фактури", "Проєкт", "Сума (€)", "Термін оплати", "Прострочено"],
        rows: invoices.map((i) => [i.number, i.project.number, i.amount.toFixed(2), formatDate(i.dueDate), isOverdue(i.dueDate) ? "Так" : "Ні"]),
      };
    }
    case "schedule-variance": {
      const projects = await prisma.project.findMany({ where: { plannedEndDate: { not: null } } });
      return {
        title: "Порівняння запланованих і фактичних строків",
        columns: ["№", "Назва", "Плановий старт", "Плановане завершення", "Фактичне завершення", "Різниця (днів)"],
        rows: projects.map((p) => {
          const diff = p.actualEndDate && p.plannedEndDate ? Math.round((p.actualEndDate.getTime() - p.plannedEndDate.getTime()) / 86400000) : "";
          return [p.number, p.name, formatDate(p.plannedStartDate), formatDate(p.plannedEndDate), formatDate(p.actualEndDate), diff];
        }),
      };
    }
  }
}

export function reportLabel(key: ReportKey): string {
  return REPORT_TYPES.find((r) => r.key === key)?.label ?? key;
}
