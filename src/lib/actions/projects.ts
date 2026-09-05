"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../db";
import { str, num, dateOrNull, requireUser } from "./helpers";

export async function createProjectAction(_prev: { error?: string } | undefined, fd: FormData) {
  const user = await requireUser();
  const name = str(fd, "name");
  const clientName = str(fd, "clientName");
  const address = str(fd, "address");
  const workType = str(fd, "workType");
  if (!name || !clientName || !address || !workType) {
    return { error: "Заповніть обов'язкові поля" };
  }

  const client = await prisma.client.create({
    data: {
      name: clientName,
      phone: str(fd, "clientPhone"),
      email: str(fd, "clientEmail"),
      address,
    },
  });

  const count = await prisma.project.count();
  const number = `RR-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const project = await prisma.project.create({
    data: {
      number,
      name,
      clientId: client.id,
      address,
      googleMapsUrl: str(fd, "googleMapsUrl"),
      pmId: str(fd, "pmId"),
      consultantId: str(fd, "consultantId"),
      workType,
      offerDate: dateOrNull(fd, "offerDate"),
      plannedStartDate: dateOrNull(fd, "plannedStartDate"),
      plannedEndDate: dateOrNull(fd, "plannedEndDate"),
      contractAmount: num(fd, "contractAmount") ?? 0,
      vatRate: num(fd, "vatRate") ?? 21,
      warrantyMonths: num(fd, "warrantyMonths") ?? 12,
      status: "NEW",
    },
  });

  await prisma.projectStatusHistory.create({
    data: { projectId: project.id, status: "NEW", changedById: user.id, note: "Проєкт створено" },
  });

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(projectId: string, fd: FormData) {
  await requireUser();
  await prisma.project.update({
    where: { id: projectId },
    data: {
      name: str(fd, "name"),
      address: str(fd, "address"),
      googleMapsUrl: str(fd, "googleMapsUrl"),
      pmId: str(fd, "pmId") || null,
      consultantId: str(fd, "consultantId") || null,
      workType: str(fd, "workType"),
      offerDate: dateOrNull(fd, "offerDate"),
      plannedStartDate: dateOrNull(fd, "plannedStartDate"),
      plannedEndDate: dateOrNull(fd, "plannedEndDate"),
      actualEndDate: dateOrNull(fd, "actualEndDate"),
      contractAmount: num(fd, "contractAmount"),
      vatRate: num(fd, "vatRate"),
      warrantyMonths: num(fd, "warrantyMonths"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function changeProjectStatusAction(projectId: string, fd: FormData) {
  const user = await requireUser();
  const status = str(fd, "status");
  const note = str(fd, "note");
  if (!status) return;

  await prisma.project.update({ where: { id: projectId }, data: { status } });
  await prisma.projectStatusHistory.create({
    data: { projectId, status, changedById: user.id, note },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
}

// ------------------ STAGES ------------------

export async function createStageAction(projectId: string, fd: FormData) {
  await requireUser();
  const name = str(fd, "name");
  if (!name) return;
  const count = await prisma.stage.count({ where: { projectId } });
  await prisma.stage.create({
    data: {
      projectId,
      name,
      description: str(fd, "description"),
      startDate: dateOrNull(fd, "startDate"),
      endDate: dateOrNull(fd, "endDate"),
      durationDays: num(fd, "durationDays"),
      responsibleId: str(fd, "responsibleId"),
      materialsNote: str(fd, "materialsNote"),
      toolsNote: str(fd, "toolsNote"),
      dependsOnId: str(fd, "dependsOnId") || null,
      status: str(fd, "status") ?? "NOT_SCHEDULED",
      order: count + 1,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateStageAction(stageId: string, projectId: string, fd: FormData) {
  await requireUser();
  await prisma.stage.update({
    where: { id: stageId },
    data: {
      name: str(fd, "name"),
      description: str(fd, "description"),
      startDate: dateOrNull(fd, "startDate"),
      endDate: dateOrNull(fd, "endDate"),
      durationDays: num(fd, "durationDays"),
      responsibleId: str(fd, "responsibleId") || null,
      materialsNote: str(fd, "materialsNote"),
      toolsNote: str(fd, "toolsNote"),
      status: str(fd, "status"),
      delayReason: str(fd, "delayReason"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateStageStatusAction(stageId: string, projectId: string, status: string, delayReason?: string) {
  await requireUser();
  await prisma.stage.update({ where: { id: stageId }, data: { status, delayReason } });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteStageAction(stageId: string, projectId: string) {
  await requireUser();
  await prisma.stage.delete({ where: { id: stageId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function addStageCommentAction(stageId: string, projectId: string, fd: FormData) {
  const user = await requireUser();
  const text = str(fd, "text");
  if (!text) return;
  await prisma.comment.create({ data: { stageId, authorId: user.id, text } });
  revalidatePath(`/projects/${projectId}`);
}

export async function assignWorkerToStageAction(stageId: string, projectId: string, workerId: string) {
  await requireUser();
  const existing = await prisma.stageAssignment.findFirst({ where: { stageId, workerId } });
  if (existing) return;
  await prisma.stageAssignment.create({ data: { stageId, workerId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function removeWorkerFromStageAction(assignmentId: string, projectId: string) {
  await requireUser();
  await prisma.stageAssignment.delete({ where: { id: assignmentId } });
  revalidatePath(`/projects/${projectId}`);
}
