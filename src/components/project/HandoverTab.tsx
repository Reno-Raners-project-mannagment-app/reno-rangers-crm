import { updateHandoverChecklistAction } from "@/lib/actions/handover";
import { CheckCircle2 } from "lucide-react";
import type { HandoverChecklist } from "@prisma/client";

const ITEMS: { key: keyof HandoverChecklist; label: string }[] = [
  { key: "allWorkDone", label: "Усі роботи виконані" },
  { key: "extraWorksConfirmed", label: "Додаткові роботи підтверджені" },
  { key: "defectsFixed", label: "Дефекти усунені" },
  { key: "siteCleaned", label: "Об'єкт прибраний" },
  { key: "wasteAndContainerRemoved", label: "Сміття та контейнер забрані" },
  { key: "materialsToolsRemoved", label: "Матеріали та інструменти вивезені" },
  { key: "finalPhotosTaken", label: "Зроблені фінальні фотографії" },
  { key: "clientInspectionDone", label: "Клієнт провів перевірку" },
  { key: "handoverProtocolSigned", label: "Підписано протокол здачі" },
  { key: "finalInvoiceIssued", label: "Виставлена фінальна фактура" },
  { key: "finalPaymentReceived", label: "Фінальна оплата отримана" },
  { key: "warrantyDocsHanded", label: "Передані гарантійні документи" },
];

export default function HandoverTab({ projectId, checklist, canEdit }: { projectId: string; checklist: HandoverChecklist | null; canEdit: boolean }) {
  const done = ITEMS.filter((i) => checklist?.[i.key]).length;
  const pct = Math.round((done / ITEMS.length) * 100);

  return (
    <div className="max-w-xl space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Готовність до здачі</span>
          <span className="text-gray-500">{done}/{ITEMS.length}</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <div className={`h-2 rounded-full ${pct === 100 ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${pct}%` }} />
        </div>
        {pct === 100 && (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} /> Усі пункти виконано — проєкт автоматично переведено у статус «Завершений»
          </p>
        )}
      </div>

      <form action={updateHandoverChecklistAction.bind(null, projectId)} className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {ITEMS.map((item) => (
          <label key={String(item.key)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
            <input type="checkbox" name={String(item.key)} defaultChecked={Boolean(checklist?.[item.key])} disabled={!canEdit} className="h-4 w-4 rounded" />
            {item.label}
          </label>
        ))}
        {canEdit && (
          <button type="submit" className="mt-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">
            Зберегти чек-лист
          </button>
        )}
      </form>
    </div>
  );
}
