"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, requireUser } from "./helpers";
import { canConfirmExtraWorkManually } from "../permissions";
import type { Role } from "../constants";

export async function createExtraWorkAction(projectId: string, fd: FormData) {
  await requireUser();
  const description = str(fd, "description");
  if (!description) return;

  await prisma.extraWork.create({
    data: {
      projectId,
      description,
      reason: str(fd, "reason"),
      laborCost: num(fd, "laborCost") ?? 0,
      materialCost: num(fd, "materialCost") ?? 0,
      vatRate: num(fd, "vatRate") ?? 21,
      sentDate: dateOrNull(fd, "sentDate"),
      executionStatus: "AWAITING_CLIENT_CONFIRMATION",
      paymentStatus: "NOT_INVOICED",
    },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}

// Client (or staff on the client's behalf) confirms the extra work.
export async function confirmExtraWorkAction(extraWorkId: string, projectId: string, method: string) {
  await requireUser();
  await prisma.extraWork.update({
    where: { id: extraWorkId },
    data: { clientConfirmed: true, confirmedAt: new Date(), confirmationMethod: method, executionStatus: "IN_PROGRESS" },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}

// A manager override lets the work start without client sign-off yet — the
// one exception carved out in the spec's business rule.
export async function approveExtraWorkManuallyAction(extraWorkId: string, projectId: string) {
  const user = await requireUser();
  if (!canConfirmExtraWorkManually(user.role as Role)) {
    throw new Error("Недостатньо прав для ручного дозволу");
  }
  await prisma.extraWork.update({
    where: { id: extraWorkId },
    data: { approvedManually: true, approvedById: user.id, executionStatus: "IN_PROGRESS" },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}

export async function updateExtraWorkExecutionAction(extraWorkId: string, projectId: string, status: string) {
  await requireUser();
  const ew = await prisma.extraWork.findUnique({ where: { id: extraWorkId } });
  if (!ew) return;
  if (status === "IN_PROGRESS" && !ew.clientConfirmed && !ew.approvedManually) {
    throw new Error("Потрібне підтвердження клієнта або ручний дозвіл керівника");
  }
  await prisma.extraWork.update({ where: { id: extraWorkId }, data: { executionStatus: status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}

export async function updateExtraWorkPaymentAction(extraWorkId: string, projectId: string, status: string) {
  await requireUser();
  await prisma.extraWork.update({ where: { id: extraWorkId }, data: { paymentStatus: status } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}

export async function rejectExtraWorkAction(extraWorkId: string, projectId: string) {
  await requireUser();
  await prisma.extraWork.update({ where: { id: extraWorkId }, data: { executionStatus: "REJECTED" } });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/extra-works");
}
