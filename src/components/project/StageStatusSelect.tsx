"use client";

import { useTransition } from "react";
import { updateStageStatusAction } from "@/lib/actions/projects";
import { STAGE_STATUSES, STAGE_STATUS_LABELS, type Locale, type StageStatus } from "@/lib/constants";

export default function StageStatusSelect({ stageId, projectId, status, locale }: { stageId: string; projectId: string; status: string; locale: Locale }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value;
        if (value === "NEEDS_FIX" || value === "PAUSED") {
          const reason = prompt("Причина?") ?? undefined;
          startTransition(() => updateStageStatusAction(stageId, projectId, value, reason));
        } else {
          startTransition(() => updateStageStatusAction(stageId, projectId, value));
        }
      }}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
    >
      {STAGE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STAGE_STATUS_LABELS[s as StageStatus][locale]}
        </option>
      ))}
    </select>
  );
}
