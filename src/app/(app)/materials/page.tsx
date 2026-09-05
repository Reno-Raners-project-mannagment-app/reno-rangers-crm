import Link from "next/link";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { formatDate, formatEUR, isOverdue } from "@/lib/format";
import { MATERIAL_STATUSES, MATERIAL_STATUS_LABELS, MATERIAL_STATUS_COLOR, type MaterialStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";

const URGENCY_ORDER: Record<string, number> = { TO_ORDER: 0, TO_BE_DEFINED: 1, DELAYED: 2, AWAITING_CONFIRMATION: 3, PARTIALLY_DELIVERED: 4, ORDERED: 5, OUT_OF_STOCK: 6, DELIVERED: 7, RETURNED: 8, CANCELLED: 9 };

export default async function MaterialsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { locale } = await getT();
  const sp = await searchParams;

  const materials = await prisma.material.findMany({
    where: sp.status ? { status: sp.status } : { project: { status: { notIn: ["COMPLETED", "ARCHIVED"] } } },
    include: { project: true, supplier: true },
  });
  materials.sort((a, b) => (URGENCY_ORDER[a.status] ?? 99) - (URGENCY_ORDER[b.status] ?? 99));

  const counts = MATERIAL_STATUSES.map((s) => ({ status: s, count: materials.filter((m) => m.status === s).length }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Матеріали</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/materials" className={`rounded-full border px-3 py-1 text-xs font-medium ${!sp.status ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}>
          Усі активні
        </Link>
        {counts.filter((c) => c.count > 0).map((c) => (
          <Link key={c.status} href={`/materials?status=${c.status}`} className={`rounded-full border px-3 py-1 text-xs font-medium ${sp.status === c.status ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}>
            {MATERIAL_STATUS_LABELS[c.status][locale]} ({c.count})
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
              <th className="px-3 py-2.5">Матеріал</th>
              <th className="px-3 py-2.5">Проєкт</th>
              <th className="px-3 py-2.5">Постачальник</th>
              <th className="px-3 py-2.5">Ціна</th>
              <th className="px-3 py-2.5">Дата доставки</th>
              <th className="px-3 py-2.5">Статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {materials.map((m) => {
              const overdue = m.expectedDeliveryDate && isOverdue(m.expectedDeliveryDate) && m.status !== "DELIVERED";
              return (
                <tr key={m.id} className={overdue ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{m.name}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/projects/${m.projectId}?tab=materials`} className="text-orange-600 hover:underline dark:text-orange-400">{m.project.number}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{m.supplier?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{m.purchasePrice ? formatEUR(m.purchasePrice * m.quantity) : "—"}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(m.actualDeliveryDate ?? m.expectedDeliveryDate)}</td>
                  <td className="px-3 py-2.5">
                    <Badge label={MATERIAL_STATUS_LABELS[m.status as MaterialStatus][locale]} color={MATERIAL_STATUS_COLOR[m.status as MaterialStatus]} />
                  </td>
                </tr>
              );
            })}
            {materials.length === 0 && <tr><td colSpan={6} className="px-3 py-10 text-center text-gray-400">Немає даних</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
