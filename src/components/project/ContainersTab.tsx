import { formatDate, formatEUR } from "@/lib/format";
import { CONTAINER_STATUSES, CONTAINER_STATUS_LABELS, CONTAINER_STATUS_COLOR, type Locale, type ContainerStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import Disclosure from "@/components/Disclosure";
import StatusInlineSelect from "@/components/StatusInlineSelect";
import { createContainerAction, updateContainerStatusAction, deleteContainerAction } from "@/lib/actions/logistics";
import { Trash2, ShieldAlert } from "lucide-react";
import type { Container, Supplier } from "@prisma/client";

type FullContainer = Container & { supplier: Supplier | null };
const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function ContainersTab({ projectId, containers, suppliers, locale, canEdit }: { projectId: string; containers: FullContainer[]; suppliers: Supplier[]; locale: Locale; canEdit: boolean }) {
  const boundCreate = createContainerAction.bind(null, projectId);

  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Додати контейнер">
          <form action={boundCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <L label="Тип відходів *"><input name="wasteType" required className={inputCls} /></L>
            <L label="Розмір *"><input name="size" required placeholder="6m³, 8m³..." className={inputCls} /></L>
            <L label="Постачальник">
              <select name="supplierId" className={inputCls} defaultValue="">
                <option value="">—</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </L>
            <L label="Або новий постачальник"><input name="newSupplierName" className={inputCls} /></L>
            <L label="Ціна (€)"><input name="price" type="number" step="0.01" className={inputCls} /></L>
            <L label="Статус">
              <select name="status" className={inputCls} defaultValue="TO_ORDER">
                {CONTAINER_STATUSES.map((s) => <option key={s} value={s}>{CONTAINER_STATUS_LABELS[s][locale]}</option>)}
              </select>
            </L>
            <L label="Планована дата доставки"><input name="plannedDeliveryDate" type="date" className={inputCls} /></L>
            <L label="Планована дата забору"><input name="plannedPickupDate" type="date" className={inputCls} /></L>
            <L label="Місце встановлення"><input name="location" className={inputCls} /></L>
            <L label="Термін дії дозволу"><input name="permitExpiry" type="date" className={inputCls} /></L>
            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <input type="checkbox" name="permitNeeded" className="rounded" /> Потрібен дозвіл на паркувальне місце
            </label>
            <div className="sm:col-span-2">
              <L label="Коментар"><textarea name="comment" rows={2} className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Додати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {containers.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{c.wasteType} · {c.size}</p>
                <p className="text-xs text-gray-400">{c.supplier?.name ?? "Постачальник не вказаний"}</p>
              </div>
              {canEdit && (
                <form action={deleteContainerAction.bind(null, c.id, projectId)}>
                  <button className="text-gray-300 hover:text-rose-500"><Trash2 size={15} /></button>
                </form>
              )}
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <p>Доставка: {formatDate(c.actualDeliveryDate ?? c.plannedDeliveryDate)}</p>
              <p>Забір: {formatDate(c.actualPickupDate ?? c.plannedPickupDate)}</p>
              {c.location && <p>Місце: {c.location}</p>}
              {c.price && <p>Ціна: {formatEUR(c.price)}</p>}
              {c.permitNeeded && (
                <p className={`flex items-center gap-1 ${c.permitExpiry ? "text-gray-500" : "text-rose-500"}`}>
                  <ShieldAlert size={12} /> {c.permitExpiry ? `Дозвіл до ${formatDate(c.permitExpiry)}` : "Дозвіл ще не отримано"}
                </p>
              )}
              {c.comment && <p className="italic">{c.comment}</p>}
            </div>
            <div className="mt-3">
              {canEdit ? (
                <StatusInlineSelect value={c.status} options={CONTAINER_STATUSES} labels={Object.fromEntries(CONTAINER_STATUSES.map((s) => [s, CONTAINER_STATUS_LABELS[s][locale]]))} action={updateContainerStatusAction.bind(null, c.id, projectId)} />
              ) : (
                <Badge label={CONTAINER_STATUS_LABELS[c.status as ContainerStatus][locale]} color={CONTAINER_STATUS_COLOR[c.status as ContainerStatus]} />
              )}
            </div>
          </div>
        ))}
        {containers.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-gray-700">Контейнери ще не додані</p>}
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
