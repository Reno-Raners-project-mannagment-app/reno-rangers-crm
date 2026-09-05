"use client";

import { useState } from "react";
import { createStageAction } from "@/lib/actions/projects";
import { WORK_STAGE_TEMPLATES, STAGE_STATUSES, STAGE_STATUS_LABELS, type Locale, type StageStatus } from "@/lib/constants";

type Option = { id: string; name: string };

export default function AddStageForm({ projectId, responsibleOptions, stageOptions, locale }: { projectId: string; responsibleOptions: Option[]; stageOptions: Option[]; locale: Locale }) {
  const [open, setOpen] = useState(false);
  const boundCreate = createStageAction.bind(null, projectId);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-600 dark:border-gray-700 dark:text-gray-400">
        + Додати етап
      </button>
    );
  }

  return (
    <form
      action={(fd) => {
        boundCreate(fd);
        setOpen(false);
      }}
      className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Назва етапу *</span>
          <input name="name" required list="stage-templates" className={inputCls} />
          <datalist id="stage-templates">
            {WORK_STAGE_TEMPLATES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Відповідальний</span>
          <select name="responsibleId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {responsibleOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Дата початку</span>
          <input name="startDate" type="date" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Дата завершення</span>
          <input name="endDate" type="date" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Тривалість (днів)</span>
          <input name="durationDays" type="number" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Залежить від етапу</span>
          <select name="dependsOnId" className={inputCls} defaultValue="">
            <option value="">—</option>
            {stageOptions.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Статус</span>
          <select name="status" className={inputCls} defaultValue="NOT_SCHEDULED">
            {STAGE_STATUSES.map((s) => (
              <option key={s} value={s}>{STAGE_STATUS_LABELS[s as StageStatus][locale]}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-gray-500">Опис</span>
        <textarea name="description" rows={2} className={inputCls} />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Необхідні матеріали</span>
          <input name="materialsNote" className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-500">Необхідні інструменти</span>
          <input name="toolsNote" className={inputCls} />
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
          Зберегти
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 dark:border-gray-700">
          Скасувати
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
