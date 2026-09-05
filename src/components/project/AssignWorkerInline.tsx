"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { assignWorkerToStageAction, removeWorkerFromStageAction } from "@/lib/actions/projects";

type Assignment = { id: string; worker: { id: string; name: string } };
type WorkerOption = { id: string; name: string };

export default function AssignWorkerInline({ stageId, projectId, assignments, workers }: { stageId: string; projectId: string; assignments: Assignment[]; workers: WorkerOption[] }) {
  const [pending, startTransition] = useTransition();
  const assignedIds = new Set(assignments.map((a) => a.worker.id));
  const available = workers.filter((w) => !assignedIds.has(w.id));

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {assignments.map((a) => (
        <span key={a.id} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
          {a.worker.name}
          <button disabled={pending} onClick={() => startTransition(() => removeWorkerFromStageAction(a.id, projectId))} className="text-gray-400 hover:text-rose-500">
            <X size={11} />
          </button>
        </span>
      ))}
      {available.length > 0 && (
        <select
          disabled={pending}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) {
              startTransition(() => assignWorkerToStageAction(stageId, projectId, e.target.value));
              e.target.value = "";
            }
          }}
          className="rounded-full border border-dashed border-gray-300 bg-transparent px-2 py-0.5 text-xs text-gray-400 dark:border-gray-700"
        >
          <option value="">+ призначити</option>
          {available.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
