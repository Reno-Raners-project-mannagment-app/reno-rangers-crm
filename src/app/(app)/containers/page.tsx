import Link from "next/link";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n/server";
import { formatDate, formatEUR } from "@/lib/format";
import { CONTAINER_STATUSES, CONTAINER_STATUS_LABELS, CONTAINER_STATUS_COLOR, type ContainerStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import { ShieldAlert } from "lucide-react";

const URGENCY_ORDER: Record<string, number> = { TO_ORDER: 0, NEEDS_PICKUP: 1, FULL: 2, REQUEST_SENT: 3, ORDERED: 4, DELIVERY_CONFIRMED: 5, PICKUP_SCHEDULED: 6, DELIVERED: 7, PICKED_UP: 8, CANCELLED: 9 };

export default async function ContainersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { locale } = await getT();
  const sp = await searchParams;

  const containers = await prisma.container.findMany({
    where: sp.status ? { status: sp.status } : { project: { status: { notIn: ["COMPLETED", "ARCHIVED"] } } },
    include: { project: true, supplier: true },
  });
  containers.sort((a, b) => (URGENCY_ORDER[a.status] ?? 99) - (URGENCY_ORDER[b.status] ?? 99));

  const counts = CONTAINER_STATUSES.map((s) => ({ status: s, count: containers.filter((c) => c.status === s).length }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Контейнери</h1>

      <div className="flex flex-wrap gap-2">
        <Link href="/containers" className={`rounded-full border px-3 py-1 text-xs font-medium ${!sp.status ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}>
          Усі активні
        </Link>
        {counts.filter((c) => c.count > 0).map((c) => (
          <Link key={c.status} href={`/containers?status=${c.status}`} className={`rounded-full border px-3 py-1 text-xs font-medium ${sp.status === c.status ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}>
            {CONTAINER_STATUS_LABELS[c.status][locale]} ({c.count})
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {containers.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{c.wasteType} · {c.size}</p>
                <Link href={`/projects/${c.projectId}?tab=containers`} className="text-xs text-orange-600 hover:underline dark:text-orange-400">{c.project.number}</Link>
              </div>
              <Badge label={CONTAINER_STATUS_LABELS[c.status as ContainerStatus][locale]} color={CONTAINER_STATUS_COLOR[c.status as ContainerStatus]} />
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500 dark:text-gray-400">
              <p>Постачальник: {c.supplier?.name ?? "—"}</p>
              <p>Доставка: {formatDate(c.actualDeliveryDate ?? c.plannedDeliveryDate)}</p>
              <p>Забір: {formatDate(c.actualPickupDate ?? c.plannedPickupDate)}</p>
              {c.price && <p>Ціна: {formatEUR(c.price)}</p>}
              {c.permitNeeded && !c.permitExpiry && (
                <p className="flex items-center gap-1 text-rose-500"><ShieldAlert size={12} /> Дозвіл не отримано</p>
              )}
              {!c.invoiceNumber && c.status !== "TO_ORDER" && <p className="text-amber-500">Фактура ще не отримана</p>}
            </div>
          </div>
        ))}
        {containers.length === 0 && <p className="col-span-full py-10 text-center text-gray-400">Немає даних</p>}
      </div>
    </div>
  );
}
