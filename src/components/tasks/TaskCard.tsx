"use client";

import { useTransition } from "react";
import Link from "next/link";
import { updateTaskStatusAction, toggleChecklistItemAction } from "@/lib/actions/tasks";
import { TASK_STATUSES, TASK_STATUS_LABELS, TASK_PRIORITY_LABELS, TASK_PRIORITY_COLOR, type Locale, type TaskPriority } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import { formatDate, isOverdue } from "@/lib/format";

type TaskLike = {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: Date | string | null;
  checklist: string | null;
  project?: { id: string; number: string; name: string } | null;
  assignee?: { name: string } | null;
};

export default function TaskCard({ task, locale }: { task: TaskLike; locale: Locale }) {
  const [pending, startTransition] = useTransition();
  const overdue = task.status !== "DONE" && task.status !== "CANCELLED" && isOverdue(task.dueDate);
  const checklist: { label: string; done: boolean }[] = task.checklist ? JSON.parse(task.checklist) : [];

  return (
    <div className={`rounded-xl border bg-white p-4 dark:bg-gray-900 ${overdue ? "border-rose-300 dark:border-rose-800" : "border-gray-200 dark:border-gray-800"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 dark:text-gray-100">{task.title}</p>
          {task.description && <p className="text-sm text-gray-500 dark:text-gray-400">{task.description}</p>}
          <p className="mt-1 text-xs text-gray-400">
            {task.project && (
              <Link href={`/projects/${task.project.id}`} className="text-orange-600 hover:underline dark:text-orange-400">
                {task.project.number}
              </Link>
            )}
            {task.assignee && ` · ${task.assignee.name}`}
            {task.dueDate && ` · Термін: ${formatDate(task.dueDate)}`}
          </p>
          {checklist.length > 0 && (
            <ul className="mt-2 space-y-1">
              {checklist.map((c, i) => (
                <li key={i}>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={c.done}
                      disabled={pending}
                      onChange={() => startTransition(() => toggleChecklistItemAction(task.id, i))}
                      className="rounded"
                    />
                    <span className={c.done ? "line-through text-gray-400" : ""}>{c.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge label={TASK_PRIORITY_LABELS[task.priority as TaskPriority][locale]} color={TASK_PRIORITY_COLOR[task.priority as TaskPriority]} />
          <select
            defaultValue={task.status}
            disabled={pending}
            onChange={(e) => startTransition(() => updateTaskStatusAction(task.id, e.target.value))}
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{TASK_STATUS_LABELS[s][locale]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
