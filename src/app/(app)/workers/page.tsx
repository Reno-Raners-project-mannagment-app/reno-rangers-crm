import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatEUR } from "@/lib/format";
import { canManageProjects } from "@/lib/permissions";
import Disclosure from "@/components/Disclosure";
import { createWorkerAction } from "@/lib/actions/workers";
import { Star } from "lucide-react";
import type { Role } from "@/lib/constants";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default async function WorkersPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const canEdit = canManageProjects(user.role as Role);

  const workers = await prisma.worker.findMany({
    include: { stageAssignments: { include: { stage: { include: { project: true } } } } },
    orderBy: { name: "asc" },
  });

  const employees = workers.filter((w) => w.type === "EMPLOYEE");
  const subs = workers.filter((w) => w.type === "SUBCONTRACTOR");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Команда</h1>
      </div>

      {canEdit && (
        <Disclosure label="Додати працівника / субпідрядника">
          <form action={createWorkerAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <L label="Ім'я / назва компанії *"><input name="name" required className={inputCls} /></L>
            <L label="Тип *">
              <select name="type" required className={inputCls} defaultValue="EMPLOYEE">
                <option value="EMPLOYEE">Власний працівник</option>
                <option value="SUBCONTRACTOR">Субпідрядник</option>
              </select>
            </L>
            <L label="Професія *"><input name="profession" required className={inputCls} /></L>
            <L label="Телефон"><input name="phone" className={inputCls} /></L>
            <L label="Email"><input name="email" type="email" className={inputCls} /></L>
            <L label="Погодинна ставка (€)"><input name="hourlyRate" type="number" step="0.01" className={inputCls} /></L>
            <L label="Проєктна ставка (€)"><input name="projectRate" type="number" step="0.01" className={inputCls} /></L>
            <div className="sm:col-span-2">
              <L label="Примітки"><textarea name="notes" rows={2} className={inputCls} /></L>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Додати</button>
            </div>
          </form>
        </Disclosure>
      )}

      <WorkerGroup title="Власні працівники" items={employees} />
      <WorkerGroup title="Субпідрядники" items={subs} />
    </div>
  );
}

function WorkerGroup({ title, items }: { title: string; items: Awaited<ReturnType<typeof prisma.worker.findMany>> }) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">{title} ({items.length})</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((w) => (
          <Link key={w.id} href={`/workers/${w.id}`} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-300 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{w.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{w.profession}</p>
              </div>
              {!w.active && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-800">неактивний</span>}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" /> {w.rating?.toFixed(1) ?? "—"}</span>
              <span>{w.hourlyRate ? `${formatEUR(w.hourlyRate)}/год` : w.projectRate ? `${formatEUR(w.projectRate)}/проєкт` : "—"}</span>
            </div>
          </Link>
        ))}
        {items.length === 0 && <p className="col-span-full text-sm text-gray-400">Немає записів</p>}
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
