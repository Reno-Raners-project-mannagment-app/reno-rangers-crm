import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export type SearchResult = { type: string; id: string; title: string; subtitle?: string; href: string };

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ results: [] }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results: SearchResult[] = [];

  const projects = await prisma.project.findMany({
    where: { OR: [{ number: { contains: q } }, { name: { contains: q } }, { address: { contains: q } }, { client: { name: { contains: q } } }] },
    include: { client: true },
    take: 8,
  });
  for (const p of projects) results.push({ type: "Проєкт", id: p.id, title: `${p.number} — ${p.name}`, subtitle: p.client.name, href: `/projects/${p.id}` });

  const workers = await prisma.worker.findMany({ where: { name: { contains: q } }, take: 6 });
  for (const w of workers) results.push({ type: "Працівник", id: w.id, title: w.name, subtitle: w.profession, href: `/workers/${w.id}` });

  const materials = await prisma.material.findMany({ where: { name: { contains: q } }, include: { project: true }, take: 6 });
  for (const m of materials) results.push({ type: "Матеріал", id: m.id, title: m.name, subtitle: m.project.number, href: `/projects/${m.projectId}?tab=materials` });

  const invoices = await prisma.invoice.findMany({ where: { number: { contains: q } }, include: { project: true }, take: 6 });
  for (const inv of invoices) results.push({ type: "Фактура", id: inv.id, title: inv.number, subtitle: inv.project.number, href: `/projects/${inv.projectId}?tab=finance` });

  const suppliers = await prisma.supplier.findMany({ where: { name: { contains: q } }, take: 6 });
  for (const s of suppliers) results.push({ type: "Постачальник", id: s.id, title: s.name, subtitle: s.category ?? undefined, href: `/materials` });

  const clients = await prisma.client.findMany({ where: { name: { contains: q } }, take: 6 });
  for (const c of clients) results.push({ type: "Клієнт", id: c.id, title: c.name, subtitle: c.address ?? undefined, href: `/projects?client=${c.id}` });

  return NextResponse.json({ results: results.slice(0, 20) });
}
