import { formatDate, formatEUR, isOverdue } from "@/lib/format";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, EXPENSE_STATUSES, EXPENSE_STATUS_LABELS, EXPENSE_STATUS_COLOR, INVOICE_TYPES, INVOICE_TYPE_LABELS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLOR, type Locale, type ExpenseStatus, type InvoiceStatus } from "@/lib/constants";
import { Badge } from "@/components/Badge";
import Disclosure from "@/components/Disclosure";
import StatusInlineSelect from "@/components/StatusInlineSelect";
import { createExpenseAction, updateExpenseStatusAction, createInvoiceAction, markInvoicePaidAction } from "@/lib/actions/finance";
import type { Expense, Invoice, ExtraWork, Project } from "@prisma/client";

const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";

export default function FinanceTab({
  project,
  expenses,
  invoices,
  extraWorks,
  locale,
  canEdit,
}: {
  project: Project;
  expenses: Expense[];
  invoices: Invoice[];
  extraWorks: ExtraWork[];
  locale: Locale;
  canEdit: boolean;
}) {
  const extraWorksConfirmedTotal = extraWorks.filter((e) => e.clientConfirmed || e.approvedManually).reduce((s, e) => s + e.laborCost + e.materialCost, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const paidExpenses = expenses.filter((e) => e.status === "PAID").reduce((s, e) => s + e.amount, 0);
  const paidIncome = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0);
  const unpaidIncome = invoices.filter((i) => i.status !== "PAID" && i.status !== "CANCELLED").reduce((s, i) => s + i.amount, 0);
  const forecastRevenue = project.contractAmount + extraWorksConfirmedTotal;
  const forecastProfit = forecastRevenue - totalExpenses;
  const actualProfit = paidIncome - paidExpenses;

  const byCategory = EXPENSE_CATEGORIES.map((cat) => ({ cat, total: expenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0) })).filter((c) => c.total > 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Договір + додаткові" value={formatEUR(forecastRevenue)} />
        <Stat label="Отримано оплат" value={formatEUR(paidIncome)} color="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Неоплачено" value={formatEUR(unpaidIncome)} color="text-amber-600 dark:text-amber-400" />
        <Stat label="Витрати всього" value={formatEUR(totalExpenses)} color="text-rose-600 dark:text-rose-400" />
        <Stat label="Прогнозований прибуток" value={formatEUR(forecastProfit)} />
        <Stat label="Фактичний прибуток" value={formatEUR(actualProfit)} />
        <Stat label="Різниця план/факт" value={formatEUR(actualProfit - forecastProfit)} />
      </div>

      {byCategory.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">Витрати за категоріями</h3>
          <div className="space-y-2">
            {byCategory.map(({ cat, total }) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-xs text-gray-500 dark:text-gray-400">{EXPENSE_CATEGORY_LABELS[cat][locale]}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-2 rounded-full bg-orange-400" style={{ width: `${Math.min(100, (total / totalExpenses) * 100)}%` }} />
                </div>
                <span className="w-24 shrink-0 text-right text-xs font-medium text-gray-700 dark:text-gray-300">{formatEUR(total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Фактури клієнту</h3>
          {canEdit && (
            <Disclosure label="Нова фактура">
              <form action={createInvoiceAction.bind(null, project.id)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <L label="Тип">
                  <select name="type" className={inputCls} defaultValue="INTERIM">
                    {INVOICE_TYPES.map((t) => <option key={t} value={t}>{INVOICE_TYPE_LABELS[t][locale]}</option>)}
                  </select>
                </L>
                <L label="Сума (€) *"><input name="amount" type="number" step="0.01" required className={inputCls} /></L>
                <L label="Дата виставлення"><input name="issueDate" type="date" className={inputCls} /></L>
                <L label="Термін оплати"><input name="dueDate" type="date" className={inputCls} /></L>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Виставити</button>
                </div>
              </form>
            </Disclosure>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">№</th>
                <th className="px-3 py-2.5">Тип</th>
                <th className="px-3 py-2.5">Сума</th>
                <th className="px-3 py-2.5">Термін оплати</th>
                <th className="px-3 py-2.5">Статус</th>
                {canEdit && <th className="px-3 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{inv.number}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{INVOICE_TYPE_LABELS[inv.type as keyof typeof INVOICE_TYPE_LABELS]?.[locale] ?? inv.type}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatEUR(inv.amount)}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(inv.dueDate)}</td>
                  <td className="px-3 py-2.5">
                    <Badge label={isOverdue(inv.dueDate) && inv.status !== "PAID" ? "Прострочено" : INVOICE_STATUS_LABELS[inv.status as InvoiceStatus]?.[locale] ?? inv.status} color={isOverdue(inv.dueDate) && inv.status !== "PAID" ? "red" : INVOICE_STATUS_COLOR[inv.status as InvoiceStatus] ?? "gray"} />
                  </td>
                  {canEdit && (
                    <td className="px-3 py-2.5">
                      {inv.status !== "PAID" && (
                        <form action={markInvoicePaidAction.bind(null, inv.id, project.id)}>
                          <button className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400">Позначити оплаченою</button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-400">Фактур ще немає</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Витрати</h3>
          {canEdit && (
            <Disclosure label="Нова витрата">
              <form action={createExpenseAction.bind(null, project.id)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <L label="Категорія *">
                  <select name="category" required className={inputCls} defaultValue="MATERIAL">
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c][locale]}</option>)}
                  </select>
                </L>
                <L label="Сума (€) *"><input name="amount" type="number" step="0.01" required className={inputCls} /></L>
                <div className="sm:col-span-2">
                  <L label="Опис *"><input name="description" required className={inputCls} /></L>
                </div>
                <L label="Дата"><input name="date" type="date" className={inputCls} /></L>
                <L label="Статус">
                  <select name="status" className={inputCls} defaultValue="PENDING">
                    {EXPENSE_STATUSES.map((s) => <option key={s} value={s}>{EXPENSE_STATUS_LABELS[s][locale]}</option>)}
                  </select>
                </L>
                <div className="sm:col-span-2">
                  <button type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Додати</button>
                </div>
              </form>
            </Disclosure>
          )}
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
                <th className="px-3 py-2.5">Опис</th>
                <th className="px-3 py-2.5">Категорія</th>
                <th className="px-3 py-2.5">Сума</th>
                <th className="px-3 py-2.5">Дата</th>
                <th className="px-3 py-2.5">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td className="px-3 py-2.5 font-medium text-gray-800 dark:text-gray-100">{e.description}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{EXPENSE_CATEGORY_LABELS[e.category as keyof typeof EXPENSE_CATEGORY_LABELS]?.[locale] ?? e.category}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatEUR(e.amount)}</td>
                  <td className="px-3 py-2.5 text-gray-600 dark:text-gray-400">{formatDate(e.date)}</td>
                  <td className="px-3 py-2.5">
                    {canEdit ? (
                      <StatusInlineSelect value={e.status} options={EXPENSE_STATUSES} labels={Object.fromEntries(EXPENSE_STATUSES.map((s) => [s, EXPENSE_STATUS_LABELS[s][locale]]))} action={updateExpenseStatusAction.bind(null, e.id, project.id)} />
                    ) : (
                      <Badge label={EXPENSE_STATUS_LABELS[e.status as ExpenseStatus][locale]} color={EXPENSE_STATUS_COLOR[e.status as ExpenseStatus]} />
                    )}
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">Витрат ще немає</td></tr>}
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

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500">{label}</span>
      {children}
    </label>
  );
}
