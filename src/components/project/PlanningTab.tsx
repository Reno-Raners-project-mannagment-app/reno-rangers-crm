import Link from "next/link";
import { formatDate } from "@/lib/format";
import { STAGE_STATUS_LABELS, STAGE_STATUS_COLOR, STAGE_STATUSES, type Locale, type StageStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import StageStatusSelect from "./StageStatusSelect";
import AddStageForm from "./AddStageForm";
import AssignWorkerInline from "./AssignWorkerInline";
import type { Stage, StageAssignment, Worker, User } from "@prisma/client";

type FullStage = Stage & {
  responsible: User | null;
  assignments: (StageAssignment & { worker: Worker })[];
  dependsOn: Stage | null;
};

export default function PlanningTab({
  projectId,
  stages,
  view,
  locale,
  responsibleOptions,
  workerOptions,
  canEdit,
}: {
  projectId: string;
  stages: FullStage[];
  view: string;
  locale: Locale;
  responsibleOptions: { id: string; name: string }[];
  workerOptions: { id: string; name: string }[];
  canEdit: boolean;
}) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5 text-sm dark:border-gray-800 dark:bg-gray-900">
          {[
            { key: "list", label: "Список" },
            { key: "kanban", label: "Kanban" },
            { key: "gantt", label: "Gantt" },
          ].map((v) => (
            <Link
              key={v.key}
              href={`/projects/${projectId}?tab=planning&view=${v.key}`}
              className={`rounded-md px-3 py-1.5 font-medium ${view === v.key ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"}`}
            >
              {v.label}
            </Link>
          ))}
        </div>
        {canEdit && <AddStageForm projectId={projectId} responsibleOptions={responsibleOptions} stageOptions={stages.map((s) => ({ id: s.id, name: s.name }))} locale={locale} />}
      </div>

      {view === "kanban" && <KanbanView stages={ordered} projectId={projectId} locale={locale} workerOptions={workerOptions} canEdit={canEdit} />}
      {view === "gantt" && <GanttView stages={ordered} />}
      {(view === "list" || !view) && <ListView stages={ordered} projectId={projectId} locale={locale} workerOptions={workerOptions} canEdit={canEdit} />}
    </div>
  );
}

function ListView({ stages, projectId, locale, workerOptions, canEdit }: { stages: FullStage[]; projectId: string; locale: Locale; workerOptions: { id: string; name: string }[]; canEdit: boolean }) {
  if (stages.length === 0) return <EmptyStages />;
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">{i + 1}</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                {s.description && <p className="text-sm text-gray-500 dark:text-gray-400">{s.description}</p>}
                <p className="mt-1 text-xs text-gray-400">
                  {formatDate(s.startDate)} → {formatDate(s.endDate)}
                  {s.durationDays ? ` · ${s.durationDays} дн.` : ""}
                  {s.responsible ? ` · Відп.: ${s.responsible.name}` : ""}
                  {s.dependsOn ? ` · Після: ${s.dependsOn.name}` : ""}
                </p>
                {(s.materialsNote || s.toolsNote) && (
                  <p className="mt-1 text-xs text-gray-400">
                    {s.materialsNote && <>Матеріали: {s.materialsNote} </>}
                    {s.toolsNote && <>· Інструменти: {s.toolsNote}</>}
                  </p>
                )}
                {s.delayReason && <p className="mt-1 text-xs text-rose-500">Причина затримки: {s.delayReason}</p>}
                <div className="mt-2">
                  <AssignWorkerInline stageId={s.id} projectId={projectId} assignments={s.assignments} workers={workerOptions} />
                </div>
              </div>
            </div>
            {canEdit ? (
              <StageStatusSelect stageId={s.id} projectId={projectId} status={s.status} locale={locale} />
            ) : (
              <Badge label={STAGE_STATUS_LABELS[s.status as StageStatus][locale]} color={STAGE_STATUS_COLOR[s.status as StageStatus]} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanView({ stages, projectId, locale, workerOptions, canEdit }: { stages: FullStage[]; projectId: string; locale: Locale; workerOptions: { id: string; name: string }[]; canEdit: boolean }) {
  if (stages.length === 0) return <EmptyStages />;
  const columns = STAGE_STATUSES;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {columns.map((col) => {
        const items = stages.filter((s) => s.status === col);
        return (
          <div key={col} className="w-64 shrink-0 rounded-xl bg-gray-100 p-2 dark:bg-gray-900">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{STAGE_STATUS_LABELS[col as StageStatus][locale]}</span>
              <span className="text-xs text-gray-400">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="rounded-lg border border-gray-200 bg-white p-2.5 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-800">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{s.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatDate(s.startDate)} → {formatDate(s.endDate)}</p>
                  <div className="mt-1.5">
                    <AssignWorkerInline stageId={s.id} projectId={projectId} assignments={s.assignments} workers={workerOptions} />
                  </div>
                  {canEdit && (
                    <div className="mt-2">
                      <StageStatusSelect stageId={s.id} projectId={projectId} status={s.status} locale={locale} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GanttView({ stages }: { stages: FullStage[] }) {
  const withDates = stages.filter((s) => s.startDate && s.endDate);
  if (withDates.length === 0) return <EmptyStages />;

  const min = new Date(Math.min(...withDates.map((s) => s.startDate!.getTime())));
  const max = new Date(Math.max(...withDates.map((s) => s.endDate!.getTime())));
  const totalDays = Math.max(1, Math.ceil((max.getTime() - min.getTime()) / 86400000) + 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-2 flex justify-between text-xs text-gray-400">
        <span>{formatDate(min)}</span>
        <span>{formatDate(max)}</span>
      </div>
      <div className="min-w-[600px] space-y-2">
        {withDates.map((s) => {
          const offsetDays = Math.floor((s.startDate!.getTime() - min.getTime()) / 86400000);
          const durationDays = Math.max(1, Math.ceil((s.endDate!.getTime() - s.startDate!.getTime()) / 86400000) + 1);
          const leftPct = (offsetDays / totalDays) * 100;
          const widthPct = (durationDays / totalDays) * 100;
          const color = STAGE_STATUS_COLOR[s.status as StageStatus];
          const barColor = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-rose-500", gray: "bg-gray-400", blue: "bg-blue-500" }[color];
          return (
            <div key={s.id} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs text-gray-600 dark:text-gray-400">{s.name}</span>
              <div className="relative h-6 flex-1 rounded bg-gray-100 dark:bg-gray-800">
                <div className={`absolute top-0.5 h-5 rounded ${barColor}`} style={{ left: `${leftPct}%`, width: `${widthPct}%`, minWidth: "8px" }} title={`${formatDate(s.startDate)} → ${formatDate(s.endDate)}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyStages() {
  return <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Ще немає жодного етапу</p>;
}
