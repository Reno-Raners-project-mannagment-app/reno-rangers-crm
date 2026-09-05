import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canViewFinance } from "@/lib/permissions";
import { formatDate, formatEUR, isOverdue } from "@/lib/format";
import { Badge } from "@/components/Badge";
import type { Role } from "@/lib/constants";

export default async function FinancePage() {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!canViewFinance(user.role as Role)) redirect("/dashboard");

  const projects = await prisma.project.findMany({
    where: { status: { notIn: ["ARCHIVED"] } },
    include: { client: true, expenses: true, invoices: true, extraWorks: true },
    orderBy: { createdAt: "desc" },
  });

  let contractTotal = 0, extraTotal = 0, paidIncome = 0, unpaidIncome = 0, expensesTotal = 0, paidExpenses = 0;
  const unpaidInvoices: { number: string; amount: number; dueDate: Date | null; projectId: string; projectNumber: string }[] = [];

  for (const p of projects) {
    contractTotal += p.contractAmount;
    const confirmedExtra = p.extraWorks.filter((e) => e.clientConfirmed || e.approvedManually).reduce((s, e) => s + e.laborCost + e.materialCost, 0);
    extraTotal += confirmedExtra;
    for (const inv of p.invoices) {
      if (inv.status === "PAID") paidIncome += inv.amount;
      else if (inv.status !== "CANCELLED") {
        unpaidIncome += inv.amount;
        unpaidInvoices.push({ number: inv.number, amount: inv.amount, dueDate: inv.dueDate, projectId: p.id, projectNumber: p.number });
      }
    }
    for (const e of p.expenses) {
      expensesTotal += e.amount;
      if (e.status === "PAID") paidExpenses += e.amount;
    }
  }

  const forecastProfit = contractTotal + extraTotal - expensesTotal;
  const actualProfit = paidIncome - paidExpenses;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Фінанси</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Договори + доп. роботи" value={formatEUR(contractTotal + extraTotal)} />
        <Stat label="Отримано" value={formatEUR(paidIncome)} color="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Неоплачено" value={formatEUR(unpaidIncome)} color="text-amber-600 dark:text-amber-400" />
        <Stat label="Витрати" value={formatEUR(expensesTotal)} color="text-rose-600 dark:text-rose-400" />
        <Stat label="Прогноз прибутку" value={formatEUR(forecastProfit)} />
        <Stat label="Фактичний прибуток" value={formatEUR(actualProfit)} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Неоплачені фактури клієнтів ({unpaidInvoices.length})</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">Фактура</th>
                <th className="px-3 py-2.5">Проєкт</th>
                <th className="px-3 py-2.5">Сума</th>
                <th className="px-3 py-2.5">Термін оплати</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {unpaidInvoices.map((inv) => (
                <tr key={inv.number}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{inv.number}</td>
                  <td className="px-3 py-2.5">
                    <Link href={`/projects/${inv.projectId}?tab=finance`} className="text-orange-600 hover:underline dark:text-orange-400">{inv.projectNumber}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatEUR(inv.amount)}</td>
                  <td className="px-3 py-2.5">
                    {isOverdue(inv.dueDate) ? <Badge label={`Прострочено · ${formatDate(inv.dueDate)}`} color="red" /> : formatDate(inv.dueDate)}
                  </td>
                </tr>
              ))}
              {unpaidInvoices.length === 0 && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-400">Немає неоплачених фактур</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-800 dark:text-gray-100">Проєкти</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">Проєкт</th>
                <th className="px-3 py-2.5">Клієнт</th>
                <th className="px-3 py-2.5 text-right">Договір</th>
                <th className="px-3 py-2.5 text-right">Витрати</th>
                <th className="px-3 py-2.5 text-right">Прогноз прибутку</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {projects.map((p) => {
                const exp = p.expenses.reduce((s, e) => s + e.amount, 0);
                const extra = p.extraWorks.filter((e) => e.clientConfirmed || e.approvedManually).reduce((s, e) => s + e.laborCost + e.materialCost, 0);
                const profit = p.contractAmount + extra - exp;
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2.5">
                      <Link href={`/projects/${p.id}?tab=finance`} className="font-medium text-orange-600 hover:underline dark:text-orange-400">{p.number}</Link>
                      <span className="ml-1 text-gray-500 dark:text-gray-400">{p.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{p.client.name}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{formatEUR(p.contractAmount)}</td>
                    <td className="px-3 py-2.5 text-right text-gray-700 dark:text-gray-300">{formatEUR(exp)}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>{formatEUR(profit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
      <p className={`text-lg font-bold ${color ?? "text-gray-900 dark:text-gray-50"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
