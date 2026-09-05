import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getCurrentUser } from "@/lib/auth";
import { getLocale } from "@/lib/i18n/server";
import { buildReport, type ReportKey } from "@/lib/reports";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const type = req.nextUrl.searchParams.get("type") as ReportKey | null;
  const format = req.nextUrl.searchParams.get("format") ?? "xlsx";
  if (!type) return NextResponse.json({ error: "missing type" }, { status: 400 });

  const locale = await getLocale();
  const report = await buildReport(type, locale);
  const filename = `${type}-${new Date().toISOString().slice(0, 10)}`;

  if (format === "pdf") {
    const doc = new jsPDF({ orientation: report.columns.length > 6 ? "landscape" : "portrait" });
    doc.setFontSize(14);
    doc.text(report.title, 14, 15);
    autoTable(doc, {
      head: [report.columns],
      body: report.rows.map((r) => r.map((c) => String(c))),
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [249, 115, 22] },
    });
    const buffer = Buffer.from(doc.output("arraybuffer"));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  const ws = XLSX.utils.aoa_to_sheet([report.columns, ...report.rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
    },
  });
}
