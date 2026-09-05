import { getT } from "@/lib/i18n/server";
import { REPORT_TYPES, buildReport, type ReportKey } from "@/lib/reports";
import { FileDown, FileSpreadsheet } from "lucide-react";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { locale } = await getT();
  const sp = await searchParams;
  const activeType = (sp.type as ReportKey) ?? REPORT_TYPES[0].key;
  const report = await buildReport(activeType, locale);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">Звіти</h1>

      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((r) => (
          <a
            key={r.key}
            href={`/reports?type=${r.key}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium ${activeType === r.key ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-500/10" : "border-gray-200 text-gray-500 dark:border-gray-800"}`}
          >
            {r.label}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        <div>
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{report.title}</h2>
          <p className="text-xs text-gray-400">{report.rows.length} рядків</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/reports?type=${activeType}&format=xlsx`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <FileSpreadsheet size={15} /> Excel
          </a>
          <a href={`/api/reports?type=${activeType}&format=pdf`} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
            <FileDown size={15} /> PDF
          </a>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-400 dark:border-gray-800">
              {report.columns.map((c) => (
                <th key={c} className="whitespace-nowrap px-3 py-2.5">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {report.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} className="whitespace-nowrap px-3 py-2 text-gray-600 dark:text-gray-400">{cell}</td>
                ))}
              </tr>
            ))}
            {report.rows.length === 0 && (
              <tr><td colSpan={report.columns.length} className="px-3 py-10 text-center text-gray-400">Немає даних</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
