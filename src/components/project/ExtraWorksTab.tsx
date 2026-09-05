import { formatDate, formatEUR } from "@/lib/format";
import {
  CONFIRMATION_METHOD_LABELS,
  EXTRA_WORK_EXECUTION_LABELS,
  EXTRA_WORK_EXECUTION_COLOR,
  EXTRA_WORK_PAYMENT_STATUSES,
  EXTRA_WORK_PAYMENT_LABELS,
  EXTRA_WORK_PAYMENT_COLOR,
  type Locale,
  type ExtraWorkExecutionStatus,
} from "@/lib/constants";
import { Badge } from "@/components/Badge";
import Disclosure from "@/components/Disclosure";
import StatusInlineSelect from "@/components/StatusInlineSelect";
import { createExtraWorkAction, confirmExtraWorkAction, approveExtraWorkManuallyAction, updateExtraWorkPaymentAction, rejectExtraWorkAction } from "@/lib/actions/extraWorks";
import { ShieldCheck } from "lucide-react";
import type { ExtraWork, User } from "@prisma/client";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function ExtraWorksTab({ projectId, extraWorks, locale, canEdit, canApproveManually }: { projectId: string; extraWorks: (ExtraWork & { approvedBy: User | null })[]; locale: Locale; canEdit: boolean; canApproveManually: boolean }) {
  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Нова додаткова робота">
          <form action={createExtraWorkAction.bind(null, projectId)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <L label="Опис *"><input name="description" required className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <L label="Причина"><input name="reason" className={inputCls} /></L>
            </div>
            <L label="Вартість роботи (€)"><input name="laborCost" type="number" step="0.01" className={inputCls} /></L>
            <L label="Вартість матеріалів (€)"><input name="materialCost" type="number" step="0.01" className={inputCls} /></L>
            <L label="ПДВ (%)"><input name="vatRate" type="number" defaultValue={21} className={inputCls} /></L>
            <L label="Дата надсилання клієнту"><input name="sentDate" type="date" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Додати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="space-y-3">
        {extraWorks.map((ew) => {
          const total = ew.laborCost + ew.materialCost;
          const withVat = total * (1 + ew.vatRate / 100);
          return (
            <div key={ew.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{ew.description}</p>
                  {ew.reason && <p className="text-sm text-gray-500 dark:text-gray-400">{ew.reason}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    Робота: {formatEUR(ew.laborCost)} · Матеріали: {formatEUR(ew.materialCost)} · Разом з ПДВ: {formatEUR(withVat)}
                  </p>
                  {ew.sentDate && <p className="text-xs text-gray-400">Надіслано клієнту: {formatDate(ew.sentDate)}</p>}
                  {ew.clientConfirmed && <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400"><ShieldCheck size={13} /> Підтверджено клієнтом ({ew.confirmationMethod ? CONFIRMATION_METHOD_LABELS[ew.confirmationMethod as keyof typeof CONFIRMATION_METHOD_LABELS]?.[locale] : ""}), {formatDate(ew.confirmedAt)}</p>}
                  {ew.approvedManually && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">Дозволено вручну: {ew.approvedBy?.name}</p>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge label={EXTRA_WORK_EXECUTION_LABELS[ew.executionStatus as ExtraWorkExecutionStatus][locale]} color={EXTRA_WORK_EXECUTION_COLOR[ew.executionStatus as ExtraWorkExecutionStatus]} />
                  {canEdit && (
                    <StatusInlineSelect
                      value={ew.paymentStatus}
                      options={EXTRA_WORK_PAYMENT_STATUSES}
                      labels={Object.fromEntries(EXTRA_WORK_PAYMENT_STATUSES.map((s) => [s, EXTRA_WORK_PAYMENT_LABELS[s][locale]]))}
                      action={updateExtraWorkPaymentAction.bind(null, ew.id, projectId)}
                    />
                  )}
                  {!ew.clientConfirmed && ew.executionStatus === "AWAITING_CLIENT_CONFIRMATION" && (
                    <Badge label={EXTRA_WORK_PAYMENT_LABELS[ew.paymentStatus as keyof typeof EXTRA_WORK_PAYMENT_LABELS]?.[locale] ?? ew.paymentStatus} color={EXTRA_WORK_PAYMENT_COLOR[ew.paymentStatus as keyof typeof EXTRA_WORK_PAYMENT_COLOR] ?? "gray"} />
                  )}
                </div>
              </div>

              {ew.executionStatus === "AWAITING_CLIENT_CONFIRMATION" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                  <form action={confirmExtraWorkAction.bind(null, ew.id, projectId, "SIGNATURE")}>
                    <button className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600">Підтвердити (підпис)</button>
                  </form>
                  <form action={confirmExtraWorkAction.bind(null, ew.id, projectId, "EMAIL")}>
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300">Підтверджено по email</button>
                  </form>
                  <form action={confirmExtraWorkAction.bind(null, ew.id, projectId, "WHATSAPP")}>
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-300">Підтверджено по WhatsApp</button>
                  </form>
                  {canApproveManually && (
                    <form action={approveExtraWorkManuallyAction.bind(null, ew.id, projectId)}>
                      <button className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">Дозволити вручну (без підтвердження)</button>
                    </form>
                  )}
                  <form action={rejectExtraWorkAction.bind(null, ew.id, projectId)}>
                    <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-rose-500">Відхилити</button>
                  </form>
                </div>
              )}
            </div>
          );
        })}
        {extraWorks.length === 0 && <p className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Додаткових робіт ще немає</p>}
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
