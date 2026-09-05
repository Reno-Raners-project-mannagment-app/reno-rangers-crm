import { formatDateTime } from "@/lib/format";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, PROJECT_STATUS_COLOR, type Locale, type ProjectStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import { changeProjectStatusAction } from "@/lib/actions/projects";
import { canEditProject } from "@/lib/permissions";
import type { Role } from "@/lib/constants";
import type { ProjectStatusHistory, User } from "@prisma/client";

type HistoryEntry = ProjectStatusHistory & { changedBy: User | null };

export default function StatusHistoryTab({
  projectId,
  currentStatus,
  history,
  locale,
  role,
}: {
  projectId: string;
  currentStatus: string;
  history: HistoryEntry[];
  locale: Locale;
  role: Role;
}) {
  const boundChange = changeProjectStatusAction.bind(null, projectId);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Історія статусів</h3>
        <ol className="space-y-0">
          {history
            .slice()
            .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime())
            .map((h, i) => (
              <li key={h.id} className="relative flex gap-3 pb-6 pl-1 last:pb-0">
                {i !== history.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-gray-200 dark:bg-gray-800" />}
                <span className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-white bg-orange-500 dark:border-gray-900" />
                <div className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge label={PROJECT_STATUS_LABELS[h.status as ProjectStatus]?.[locale] ?? h.status} color={PROJECT_STATUS_COLOR[h.status as ProjectStatus] ?? "gray"} />
                    <span className="text-xs text-gray-400">{formatDateTime(h.changedAt)}</span>
                  </div>
                  {h.note && <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300">{h.note}</p>}
                  <p className="mt-1 text-xs text-gray-400">{h.changedBy?.name ?? "Система"}</p>
                </div>
              </li>
            ))}
        </ol>
      </div>

      {canEditProject(role) && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Змінити статус</h3>
          <form action={boundChange} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <select name="status" defaultValue={currentStatus} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{PROJECT_STATUS_LABELS[s][locale]}</option>
              ))}
            </select>
            <textarea name="note" placeholder="Коментар до зміни статусу (необов'язково)" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" />
            <button type="submit" className="w-full rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600">
              Оновити статус
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
