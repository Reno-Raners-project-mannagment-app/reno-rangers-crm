import { formatDate } from "@/lib/format";
import Disclosure from "@/components/Disclosure";
import { createScheduleEntryVoidAction, confirmScheduleEntryAction, deleteScheduleEntryAction } from "@/lib/actions/workers";
import { CheckCircle2, Trash2 } from "lucide-react";
import type { ScheduleEntry, Worker, TimeLog, Stage, User } from "@prisma/client";

type FullEntry = ScheduleEntry & { worker: Worker; stage: Stage | null; responsible: User | null };
type FullLog = TimeLog & { worker: Worker };
const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function TeamTab({
  projectId,
  entries,
  timeLogs,
  workers,
  stages,
  canEdit,
}: {
  projectId: string;
  entries: FullEntry[];
  timeLogs: FullLog[];
  workers: Worker[];
  stages: Stage[];
  canEdit: boolean;
}) {
  return (
    <div className="space-y-5">
      {canEdit && (
        <Disclosure label="Запланувати роботу працівника">
          <form action={createScheduleEntryVoidAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input type="hidden" name="projectId" value={projectId} />
            <L label="Працівник / субпідрядник *">
              <select name="workerId" required className={inputCls} defaultValue="">
                <option value="" disabled>Оберіть...</option>
                {workers.map((w) => <option key={w.id} value={w.id}>{w.name} ({w.profession})</option>)}
              </select>
            </L>
            <L label="Етап">
              <select name="stageId" className={inputCls} defaultValue="">
                <option value="">—</option>
                {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </L>
            <L label="Дата *"><input name="date" type="date" required className={inputCls} /></L>
            <div className="grid grid-cols-2 gap-3">
              <L label="Початок *"><input name="startTime" type="time" required defaultValue="08:00" className={inputCls} /></L>
              <L label="Завершення *"><input name="endTime" type="time" required defaultValue="16:00" className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <L label="Завдання"><input name="task" className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Запланувати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Розклад команди</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">Дата</th>
                <th className="px-3 py-2.5">Працівник</th>
                <th className="px-3 py-2.5">Час</th>
                <th className="px-3 py-2.5">Завдання</th>
                <th className="px-3 py-2.5">Підтверджено</th>
                {canEdit && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{e.worker.name}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{e.startTime}–{e.endTime}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{e.task ?? e.stage?.name ?? "—"}</td>
                  <td className="px-3 py-2.5">
                    {e.confirmed ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14} /> Так</span>
                    ) : canEdit ? (
                      <form action={confirmScheduleEntryAction.bind(null, e.id)}>
                        <button className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400">Підтвердити</button>
                      </form>
                    ) : (
                      <span className="text-gray-400">Ні</span>
                    )}
                  </td>
                  {canEdit && (
                    <td className="px-3 py-2.5">
                      <form action={deleteScheduleEntryAction.bind(null, e.id)}>
                        <button className="text-gray-300 hover:text-rose-500"><Trash2 size={15} /></button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {entries.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">Розклад ще не сформовано</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Відпрацьовані години</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">Дата</th>
                <th className="px-3 py-2.5">Працівник</th>
                <th className="px-3 py-2.5">Час</th>
                <th className="px-3 py-2.5">Виконана робота</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {timeLogs.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(l.date)}</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{l.worker.name}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{l.startTime}–{l.endTime} {l.breakMinutes ? `(перерва ${l.breakMinutes} хв)` : ""}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{l.workDone ?? "—"}</td>
                </tr>
              ))}
              {timeLogs.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-400">Годин ще не записано</td></tr>}
            </tbody>
          </table>
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
