import { formatDate } from "@/lib/format";
import Disclosure from "@/components/Disclosure";
import { createDailyReportAction } from "@/lib/actions/reports";
import { AlertCircle } from "lucide-react";
import type { DailyReport, User } from "@prisma/client";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function DailyReportsTab({ projectId, reports, canEdit }: { projectId: string; reports: (DailyReport & { author: User | null })[]; canEdit: boolean }) {
  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Заповнити щоденний звіт">
          <form action={createDailyReportAction.bind(null, projectId)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <L label="Дата"><input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} /></L>
            <L label="Відпрацьовано годин (сумарно)"><input name="hoursWorked" type="number" step="0.5" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <L label="Хто був на об'єкті"><input name="workersPresent" className={inputCls} placeholder="Іван Коваленко, Петро Мельник..." /></L>
            </div>
            <div className="sm:col-span-2">
              <L label="Що виконано *"><textarea name="workDone" required rows={2} className={inputCls} /></L>
            </div>
            <L label="Використані матеріали"><input name="materialsUsed" className={inputCls} /></L>
            <L label="Матеріали, що закінчуються"><input name="materialsRunningLow" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <L label="Проблеми"><input name="issuesFound" className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <L label="План на наступний день"><input name="planForTomorrow" className={inputCls} /></L>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" name="hasDelay" className="rounded" /> Є затримка
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" name="needsManagerDecision" className="rounded" /> Потрібне рішення керівника
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Зберегти звіт</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(r.date)}</p>
              <div className="flex items-center gap-2">
                {r.hasDelay && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-400">Затримка</span>}
                {r.needsManagerDecision && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    <AlertCircle size={11} /> Потрібне рішення
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-400">{r.author?.name} {r.hoursWorked ? `· ${r.hoursWorked} год` : ""}</p>
            {r.workersPresent && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">На об'єкті: {r.workersPresent}</p>}
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{r.workDone}</p>
            {r.materialsUsed && <p className="mt-1 text-xs text-gray-400">Матеріали: {r.materialsUsed}</p>}
            {r.materialsRunningLow && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Закінчується: {r.materialsRunningLow}</p>}
            {r.issuesFound && <p className="mt-1 text-xs text-rose-500">Проблеми: {r.issuesFound}</p>}
            {r.planForTomorrow && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">План: {r.planForTomorrow}</p>}
          </div>
        ))}
        {reports.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Звітів ще немає</p>}
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
