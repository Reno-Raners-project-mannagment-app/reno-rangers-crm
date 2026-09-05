import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canManageProjects } from "@/lib/permissions";
import { formatDate, formatEUR } from "@/lib/format";
import { updateWorkerAction, toggleWorkerActiveAction, createTimeLogVoidAction } from "@/lib/actions/workers";
import Disclosure from "@/components/Disclosure";
import { Star } from "lucide-react";
import type { Role } from "@/lib/constants";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default async function WorkerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { id } = await params;
  const canEdit = canManageProjects(user.role as Role);

  const worker = await prisma.worker.findUnique({
    where: { id },
    include: {
      scheduleEntries: { include: { project: true }, orderBy: { date: "desc" }, take: 10 },
      timeLogs: { include: { project: true }, orderBy: { date: "desc" }, take: 10 },
      stageAssignments: { include: { stage: { include: { project: true } } } },
    },
  });
  if (!worker) notFound();

  const activeProjects = [...new Map(worker.stageAssignments.map((a) => [a.stage.project.id, a.stage.project])).values()];
  const projects = await prisma.project.findMany({ where: { status: { notIn: ["COMPLETED", "ARCHIVED"] } } });

  const updateAction = updateWorkerAction.bind(null, worker.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{worker.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{worker.profession} · {worker.type === "EMPLOYEE" ? "Власний працівник" : "Субпідрядник"}</p>
        </div>
        {canEdit && (
          <form action={toggleWorkerActiveAction.bind(null, worker.id, !worker.active)}>
            <button className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${worker.active ? "border-rose-200 text-rose-600" : "border-emerald-200 text-emerald-600"}`}>
              {worker.active ? "Деактивувати" : "Активувати"}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Контакти та ставка</h3>
            {canEdit ? (
              <form action={updateAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <L label="Ім'я"><input name="name" defaultValue={worker.name} className={inputCls} /></L>
                <L label="Професія"><input name="profession" defaultValue={worker.profession} className={inputCls} /></L>
                <L label="Телефон"><input name="phone" defaultValue={worker.phone ?? ""} className={inputCls} /></L>
                <L label="Email"><input name="email" defaultValue={worker.email ?? ""} className={inputCls} /></L>
                <L label="Погодинна ставка (€)"><input name="hourlyRate" type="number" step="0.01" defaultValue={worker.hourlyRate ?? ""} className={inputCls} /></L>
                <L label="Проєктна ставка (€)"><input name="projectRate" type="number" step="0.01" defaultValue={worker.projectRate ?? ""} className={inputCls} /></L>
                <L label="Оцінка якості (0-5)"><input name="rating" type="number" step="0.1" min="0" max="5" defaultValue={worker.rating ?? ""} className={inputCls} /></L>
                <div className="sm:col-span-2">
                  <L label="Примітки"><textarea name="notes" rows={2} defaultValue={worker.notes ?? ""} className={inputCls} /></L>
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Зберегти</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                <p>Телефон: {worker.phone ?? "—"}</p>
                <p>Email: {worker.email ?? "—"}</p>
                <p>Ставка: {worker.hourlyRate ? `${formatEUR(worker.hourlyRate)}/год` : worker.projectRate ? `${formatEUR(worker.projectRate)}/проєкт` : "—"}</p>
                <p className="flex items-center gap-1"><Star size={13} className="fill-amber-400 text-amber-400" /> {worker.rating?.toFixed(1) ?? "—"}</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Проєкти, на яких працює</h3>
            <div className="space-y-1">
              {activeProjects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block text-sm text-orange-600 hover:underline dark:text-orange-400">
                  {p.number} — {p.name}
                </Link>
              ))}
              {activeProjects.length === 0 && <p className="text-sm text-gray-400">Наразі не призначений на активні проєкти</p>}
            </div>
          </div>

          <Disclosure label="Записати відпрацьовані години">
            <form action={createTimeLogVoidAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input type="hidden" name="workerId" value={worker.id} />
              <L label="Проєкт *">
                <select name="projectId" required className={inputCls} defaultValue="">
                  <option value="" disabled>Оберіть...</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.number} — {p.name}</option>)}
                </select>
              </L>
              <L label="Дата *"><input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} /></L>
              <L label="Початок *"><input name="startTime" type="time" required defaultValue="08:00" className={inputCls} /></L>
              <L label="Завершення *"><input name="endTime" type="time" required defaultValue="16:00" className={inputCls} /></L>
              <L label="Перерва (хв)"><input name="breakMinutes" type="number" defaultValue={30} className={inputCls} /></L>
              <L label="Матеріали використано"><input name="materialsUsed" className={inputCls} /></L>
              <div className="sm:col-span-2">
                <L label="Виконана робота"><textarea name="workDone" rows={2} className={inputCls} /></L>
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Зберегти</button>
              </div>
            </form>
          </Disclosure>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Останній розклад</h3>
            <div className="space-y-2 text-sm">
              {worker.scheduleEntries.map((e) => (
                <div key={e.id} className="border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">{formatDate(e.date)} · {e.startTime}–{e.endTime}</p>
                  <Link href={`/projects/${e.projectId}`} className="text-xs text-orange-600 hover:underline dark:text-orange-400">{e.project.number}</Link>
                </div>
              ))}
              {worker.scheduleEntries.length === 0 && <p className="text-sm text-gray-400">Немає записів</p>}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Останні відпрацьовані години</h3>
            <div className="space-y-2 text-sm">
              {worker.timeLogs.map((l) => (
                <div key={l.id} className="border-b border-gray-100 pb-2 last:border-0 dark:border-gray-800">
                  <p className="text-gray-700 dark:text-gray-300">{formatDate(l.date)} · {l.startTime}–{l.endTime}</p>
                  <p className="text-xs text-gray-400">{l.project.number}{l.workDone ? ` — ${l.workDone}` : ""}</p>
                </div>
              ))}
              {worker.timeLogs.length === 0 && <p className="text-sm text-gray-400">Немає записів</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
