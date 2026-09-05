import { formatDate, formatEUR } from "@/lib/format";
import { MATERIAL_STATUSES, MATERIAL_STATUS_LABELS, MATERIAL_STATUS_COLOR, type Locale, type MaterialStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import Disclosure from "@/components/Disclosure";
import StatusInlineSelect from "@/components/StatusInlineSelect";
import { createMaterialAction, updateMaterialStatusAction, deleteMaterialAction } from "@/lib/actions/logistics";
import { Trash2 } from "lucide-react";
import type { Material, Supplier } from "@prisma/client";

type FullMaterial = Material & { supplier: Supplier | null };
const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function MaterialsTab({ projectId, materials, suppliers, locale, canEdit }: { projectId: string; materials: FullMaterial[]; suppliers: Supplier[]; locale: Locale; canEdit: boolean }) {
  const boundCreate = createMaterialAction.bind(null, projectId);

  return (
    <div className="space-y-4">
      {canEdit && (
        <Disclosure label="Додати матеріал">
          <form action={boundCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <L label="Назва *"><input name="name" required className={inputCls} /></L>
            <L label="Категорія"><input name="category" className={inputCls} /></L>
            <L label="Кількість *"><input name="quantity" type="number" step="0.01" required defaultValue={1} className={inputCls} /></L>
            <L label="Одиниця виміру *"><input name="unit" required placeholder="шт, м², кг..." className={inputCls} /></L>
            <L label="Постачальник">
              <select name="supplierId" className={inputCls} defaultValue="">
                <option value="">—</option>
                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </L>
            <L label="Або новий постачальник"><input name="newSupplierName" className={inputCls} placeholder="Назва нового постачальника" /></L>
            <L label="Закупівельна ціна (€)"><input name="purchasePrice" type="number" step="0.01" className={inputCls} /></L>
            <L label="Статус">
              <select name="status" className={inputCls} defaultValue="TO_BE_DEFINED">
                {MATERIAL_STATUSES.map((s) => <option key={s} value={s}>{MATERIAL_STATUS_LABELS[s][locale]}</option>)}
              </select>
            </L>
            <L label="Планована дата замовлення"><input name="plannedOrderDate" type="date" className={inputCls} /></L>
            <L label="Очікувана дата доставки"><input name="expectedDeliveryDate" type="date" className={inputCls} /></L>
            <L label="Адреса доставки"><input name="deliveryAddress" className={inputCls} /></L>
            <L label="Номер замовлення"><input name="orderNumber" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <L label="Коментар"><textarea name="comment" rows={2} className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Додати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
              <th className="px-3 py-2.5">Назва</th>
              <th className="px-3 py-2.5">К-сть</th>
              <th className="px-3 py-2.5">Постачальник</th>
              <th className="px-3 py-2.5">Ціна</th>
              <th className="px-3 py-2.5">Дата замовлення</th>
              <th className="px-3 py-2.5">Дата доставки</th>
              <th className="px-3 py-2.5">Статус</th>
              {canEdit && <th className="px-3 py-2.5" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {materials.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2.5">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{m.name}</p>
                  {m.comment && <p className="text-xs text-gray-400">{m.comment}</p>}
                </td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{m.quantity} {m.unit}</td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{m.supplier?.name ?? "—"}</td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{m.purchasePrice ? formatEUR(m.purchasePrice * m.quantity) : "—"}</td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(m.actualOrderDate ?? m.plannedOrderDate)}</td>
                <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(m.actualDeliveryDate ?? m.expectedDeliveryDate)}</td>
                <td className="px-3 py-2.5">
                  {canEdit ? (
                    <StatusInlineSelect value={m.status} options={MATERIAL_STATUSES} labels={Object.fromEntries(MATERIAL_STATUSES.map((s) => [s, MATERIAL_STATUS_LABELS[s][locale]]))} action={updateMaterialStatusAction.bind(null, m.id, projectId)} />
                  ) : (
                    <Badge label={MATERIAL_STATUS_LABELS[m.status as MaterialStatus][locale]} color={MATERIAL_STATUS_COLOR[m.status as MaterialStatus]} />
                  )}
                </td>
                {canEdit && (
                  <td className="px-3 py-2.5">
                    <form action={deleteMaterialAction.bind(null, m.id, projectId)}>
                      <button className="text-gray-300 hover:text-rose-500"><Trash2 size={15} /></button>
                    </form>
                  </td>
                )}
              </tr>
            ))}
            {materials.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-400">Матеріали ще не додані</td></tr>
            )}
          </tbody>
        </table>
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
