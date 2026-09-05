import { formatDate, formatEUR } from "@/lib/format";
import { ISSUE_PRIORITIES, ISSUE_PRIORITY_LABELS, ISSUE_PRIORITY_COLOR, ISSUE_STATUSES, ISSUE_STATUS_LABELS, ISSUE_STATUS_COLOR, type Locale, type IssuePriority, type IssueStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import Disclosure from "@/components/Disclosure";
import StatusInlineSelect from "@/components/StatusInlineSelect";
import { createIssueAction, updateIssueStatusAction } from "@/lib/actions/issues";
import { AlertTriangle } from "lucide-react";
import type { Issue, User } from "@prisma/client";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function IssuesTab({ projectId, issues, responsibleOptions, locale, canEdit }: { projectId: string; issues: (Issue & { responsible: User | null })[]; responsibleOptions: { id: string; name: string }[]; locale: Locale; canEdit: boolean }) {
  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Зареєструвати проблему">
          <form action={createIssueAction.bind(null, projectId)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <L label="Опис *"><input name="description" required className={inputCls} /></L>
            </div>
            <L label="Категорія"><input name="category" className={inputCls} placeholder="Якість, конструкція, монтаж..." /></L>
            <L label="Відповідальний">
              <select name="responsibleId" className={inputCls} defaultValue="">
                <option value="">—</option>
                {responsibleOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </L>
            <L label="Пріоритет">
              <select name="priority" className={inputCls} defaultValue="MEDIUM">
                {ISSUE_PRIORITIES.map((p) => <option key={p} value={p}>{ISSUE_PRIORITY_LABELS[p][locale]}</option>)}
              </select>
            </L>
            <L label="Строк виправлення"><input name="dueDate" type="date" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <L label="Заплановане рішення"><input name="plannedSolution" className={inputCls} /></L>
            </div>
            <L label="Фінансовий вплив (€)"><input name="financialImpact" type="number" step="0.01" className={inputCls} /></L>
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" name="affectsEndDate" className="rounded" /> Впливає на дату завершення
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Зареєструвати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="space-y-3">
        {issues.map((issue) => (
          <div key={issue.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                  <AlertTriangle size={15} className="text-amber-500" /> {issue.description}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {issue.category ?? "Без категорії"} · Виявлено {formatDate(issue.detectedDate)} · Відп.: {issue.responsible?.name ?? "—"}
                  {issue.dueDate ? ` · Строк: ${formatDate(issue.dueDate)}` : ""}
                  {issue.affectsEndDate ? " · Впливає на строк завершення" : ""}
                  {issue.financialImpact ? ` · Вплив на бюджет: ${formatEUR(issue.financialImpact)}` : ""}
                </p>
                {issue.plannedSolution && <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Рішення: {issue.plannedSolution}</p>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge label={ISSUE_PRIORITY_LABELS[issue.priority as IssuePriority][locale]} color={ISSUE_PRIORITY_COLOR[issue.priority as IssuePriority]} />
                {canEdit ? (
                  <StatusInlineSelect value={issue.status} options={ISSUE_STATUSES} labels={Object.fromEntries(ISSUE_STATUSES.map((s) => [s, ISSUE_STATUS_LABELS[s][locale]]))} action={updateIssueStatusAction.bind(null, issue.id, projectId)} />
                ) : (
                  <Badge label={ISSUE_STATUS_LABELS[issue.status as IssueStatus][locale]} color={ISSUE_STATUS_COLOR[issue.status as IssueStatus]} />
                )}
              </div>
            </div>
          </div>
        ))}
        {issues.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Проблем не зафіксовано</p>}
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
