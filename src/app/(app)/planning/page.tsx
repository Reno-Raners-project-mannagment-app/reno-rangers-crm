import Link from "next/link";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, startOfWeek } from "@/lib/format";
import { getWorkerDoubleBookings } from "@/lib/alerts";
import Disclosure from "@/components/Disclosure";
import { createScheduleEntryVoidAction, confirmScheduleEntryAction, deleteScheduleEntryAction } from "@/lib/actions/workers";
import type { Role } from "@/lib/constants";
import { CheckCircle2, Trash2 } from "lucide-react";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
const DAY_LABELS = ["Понеділок", "Вівторок", "Середа", "Четвер", "П'ятниця", "Субота", "Неділя"];

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const role = user.role as Role;
  const sp = await searchParams;
  const weekOffset = Number(sp.week ?? 0) || 0;

  const base = new Date();
  base.setDate(base.getDate() + weekOffset * 7);
  const monday = startOfWeek(base);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const sunday = days[6];
  const rangeEnd = new Date(sunday);
  rangeEnd.setHours(23, 59, 59, 999);

  let worker = null;
  if (role === "WORKER" || role === "SUBCONTRACTOR") {
    worker = await prisma.worker.findUnique({ where: { userId: user.id } });
  }

  const entries = await prisma.scheduleEntry.findMany({
    where: {
      date: { gte: monday, lte: rangeEnd },
      ...(worker ? { workerId: worker.id } : {}),
    },
    include: { worker: true, project: true, stage: true, responsible: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const canEdit = role === "OWNER_ADMIN" || role === "PROJECT_MANAGER" || role === "OFFICE_MANAGER";
  const conflicts = canEdit ? (await Promise.all(days.map((d) => getWorkerDoubleBookings(d)))).flat() : [];

  const [workers, projects] = canEdit
    ? await Promise.all([prisma.worker.findMany({ where: { active: true } }), prisma.project.findMany({ where: { status: { notIn: ["COMPLETED", "ARCHIVED"] } } })])
    : [[], []];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Планування</h1>
        <div className="flex items-center gap-2">
          <Link href={`/planning?week=${weekOffset - 1}`} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800">
            <ChevronLeft size={16} />
          </Link>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {formatDate(monday)} – {formatDate(sunday)}
          </span>
          <Link href={`/planning?week=${weekOffset + 1}`} className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-800">
            <ChevronRight size={16} />
          </Link>
          {weekOffset !== 0 && (
            <Link href="/planning" className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400">
              Сьогодні
            </Link>
          )}
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Виявлено накладання розкладу:</p>
            <ul className="mt-1 list-inside list-disc">
              {conflicts.map((c, i) => (
                <li key={i}>{c.worker} запланований(-а) на два проєкти одночасно</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {canEdit && (
        <Disclosure label="Запланувати роботу">
          <form action={createScheduleEntryVoidAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <L label="Працівник *">
              <select name="workerId" required className={inputCls} defaultValue="">
                <option value="" disabled>Оберіть...</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </L>
            <L label="Проєкт *">
              <select name="projectId" required className={inputCls} defaultValue="">
                <option value="" disabled>Оберіть...</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}
              </select>
            </L>
            <L label="Дата *"><input name="date" type="date" required defaultValue={formatIso(monday)} className={inputCls} /></L>
            <L label="Початок *"><input name="startTime" type="time" required defaultValue="08:00" className={inputCls} /></L>
            <L label="Завершення *"><input name="endTime" type="time" required defaultValue="16:00" className={inputCls} /></L>
            <L label="Завдання"><input name="task" className={inputCls} /></L>
            <div className="lg:col-span-3">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Запланувати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
        {days.map((d, i) => {
          const dayEntries = entries.filter((e) => sameDay(e.date, d));
          const isToday = sameDay(d, new Date());
          return (
            <div key={i} className={`rounded-xl border bg-white p-3 dark:bg-gray-900 ${isToday ? "border-orange-300 dark:border-orange-800" : "border-gray-200 dark:border-gray-800"}`}>
              <p className={`mb-2 text-xs font-semibold uppercase ${isToday ? "text-orange-600 dark:text-orange-400" : "text-gray-400"}`}>
                {DAY_LABELS[i]} · {formatDate(d)}
              </p>
              <div className="space-y-2">
                {dayEntries.map((e) => (
                  <div key={e.id} className="rounded-lg border border-gray-100 bg-gray-50 p-2 text-xs dark:border-gray-800 dark:bg-gray-800/50">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{e.worker.name}</p>
                    <p className="text-gray-500 dark:text-gray-400">{e.startTime}–{e.endTime}</p>
                    <Link href={`/projects/${e.projectId}`} className="block truncate text-orange-600 hover:underline dark:text-orange-400">{e.project.number}</Link>
                    {e.task && <p className="truncate text-gray-500 dark:text-gray-400">{e.task}</p>}
                    <div className="mt-1 flex items-center justify-between">
                      {e.confirmed ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={11} /> OK</span>
                      ) : canEdit ? (
                        <form action={confirmScheduleEntryAction.bind(null, e.id)}>
                          <button className="font-medium text-amber-600 hover:underline dark:text-amber-400">Підтвердити</button>
                        </form>
                      ) : (
                        <span className="text-amber-500">Очікує</span>
                      )}
                      {canEdit && (
                        <form action={deleteScheduleEntryAction.bind(null, e.id)}>
                          <button className="text-gray-300 hover:text-rose-500"><Trash2 size={12} /></button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
                {dayEntries.length === 0 && <p className="text-xs text-gray-300 dark:text-gray-600">—</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatIso(d: Date) {
  return d.toISOString().slice(0, 10);
}
function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
