"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, requireUser } from "./helpers";
import { getWorkerDoubleBookings } from "../alerts";

export async function createWorkerAction(fd: FormData) {
  await requireUser();
  const name = str(fd, "name");
  const type = str(fd, "type");
  const profession = str(fd, "profession");
  if (!name || !type || !profession) return;

  await prisma.worker.create({
    data: {
      name,
      type,
      profession,
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      hourlyRate: num(fd, "hourlyRate"),
      projectRate: num(fd, "projectRate"),
      notes: str(fd, "notes"),
    },
  });
  revalidatePath("/workers");
}

export async function updateWorkerAction(workerId: string, fd: FormData) {
  await requireUser();
  await prisma.worker.update({
    where: { id: workerId },
    data: {
      name: str(fd, "name"),
      profession: str(fd, "profession"),
      phone: str(fd, "phone"),
      email: str(fd, "email"),
      hourlyRate: num(fd, "hourlyRate"),
      projectRate: num(fd, "projectRate"),
      rating: num(fd, "rating"),
      notes: str(fd, "notes"),
    },
  });
  revalidatePath("/workers");
  revalidatePath(`/workers/${workerId}`);
}

export async function toggleWorkerActiveAction(workerId: string, active: boolean) {
  await requireUser();
  await prisma.worker.update({ where: { id: workerId }, data: { active } });
  revalidatePath("/workers");
}

// ------------------ SCHEDULING ------------------

export async function createScheduleEntryAction(fd: FormData) {
  await requireUser();
  const workerId = str(fd, "workerId");
  const projectId = str(fd, "projectId");
  const date = dateOrNull(fd, "date");
  const startTime = str(fd, "startTime");
  const endTime = str(fd, "endTime");
  if (!workerId || !projectId || !date || !startTime || !endTime) {
    return { error: "Заповніть усі обов'язкові поля" };
  }

  await prisma.scheduleEntry.create({
    data: {
      workerId,
      projectId,
      stageId: str(fd, "stageId") || null,
      date,
      startTime,
      endTime,
      task: str(fd, "task"),
      responsibleId: str(fd, "responsibleId"),
      confirmed: false,
    },
  });

  const conflicts = await getWorkerDoubleBookings(date);
  revalidatePath("/planning");
  revalidatePath(`/projects/${projectId}`);
  return { conflicts: conflicts.length > 0 ? conflicts.map((c) => c.worker) : undefined };
}

export async function confirmScheduleEntryAction(entryId: string) {
  await requireUser();
  const entry = await prisma.scheduleEntry.update({ where: { id: entryId }, data: { confirmed: true } });
  revalidatePath("/planning");
  revalidatePath(`/projects/${entry.projectId}`);
}

export async function deleteScheduleEntryAction(entryId: string) {
  await requireUser();
  const entry = await prisma.scheduleEntry.delete({ where: { id: entryId } });
  revalidatePath("/planning");
  revalidatePath(`/projects/${entry.projectId}`);
}

// ------------------ TIME LOGS ------------------

export async function createTimeLogAction(fd: FormData) {
  const user = await requireUser();
  const worker = await prisma.worker.findUnique({ where: { userId: user.id } });
  const workerId = str(fd, "workerId") || worker?.id;
  const projectId = str(fd, "projectId");
  const date = dateOrNull(fd, "date");
  const startTime = str(fd, "startTime");
  const endTime = str(fd, "endTime");
  if (!workerId || !projectId || !date || !startTime || !endTime) {
    return { error: "Заповніть усі обов'язкові поля" };
  }

  await prisma.timeLog.create({
    data: {
      workerId,
      projectId,
      date,
      startTime,
      endTime,
      breakMinutes: num(fd, "breakMinutes") ?? 0,
      workDone: str(fd, "workDone"),
      materialsUsed: str(fd, "materialsUsed"),
      comment: str(fd, "comment"),
    },
  });
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/workers/${workerId}`);
}

// Void-returning wrappers for plain (non-useActionState) <form action={...}>
// usages, where the caller doesn't need the {error/conflicts} result.
export async function createScheduleEntryVoidAction(fd: FormData): Promise<void> {
  await createScheduleEntryAction(fd);
}

export async function createTimeLogVoidAction(fd: FormData): Promise<void> {
  await createTimeLogAction(fd);
}
