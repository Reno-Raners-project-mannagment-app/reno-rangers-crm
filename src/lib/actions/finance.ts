"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, requireUser } from "./helpers";

export async function createExpenseAction(projectId: string, fd: FormData) {
  await requireUser();
  const description = str(fd, "description");
  const amount = num(fd, "amount");
  const category = str(fd, "category");
  if (!description || amount === undefined || !category) return;

  await prisma.expense.create({
    data: {
      projectId,
      category,
      description,
      amount,
      status: str(fd, "status") ?? "PENDING",
      date: dateOrNull(fd, "date") ?? new Date(),
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}

export async function updateExpenseStatusAction(expenseId: string, projectId: string, status: string) {
  await requireUser();
  await prisma.expense.update({ where: { id: expenseId }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}

export async function deleteExpenseAction(expenseId: string, projectId: string) {
  await requireUser();
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}

export async function createInvoiceAction(projectId: string, fd: FormData) {
  await requireUser();
  const amount = num(fd, "amount");
  if (amount === undefined) return;
  const count = await prisma.invoice.count();
  const number = str(fd, "number") || `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

  await prisma.invoice.create({
    data: {
      projectId,
      number,
      type: str(fd, "type") ?? "INTERIM",
      amount,
      vatRate: num(fd, "vatRate") ?? 21,
      issueDate: dateOrNull(fd, "issueDate") ?? new Date(),
      dueDate: dateOrNull(fd, "dueDate"),
      status: str(fd, "status") ?? "SENT",
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}

export async function markInvoicePaidAction(invoiceId: string, projectId: string) {
  await requireUser();
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "PAID", paidDate: new Date() } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}

export async function updateInvoiceStatusAction(invoiceId: string, projectId: string, status: string) {
  await requireUser();
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/finance");
}
