"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, bool, requireUser } from "./helpers";

export async function createIssueAction(projectId: string, fd: FormData) {
  const user = await requireUser();
  const description = str(fd, "description");
  if (!description) return;

  await prisma.issue.create({
    data: {
      projectId,
      description,
      category: str(fd, "category"),
      responsibleId: str(fd, "responsibleId") || user.id,
      priority: str(fd, "priority") ?? "MEDIUM",
      plannedSolution: str(fd, "plannedSolution"),
      dueDate: dateOrNull(fd, "dueDate"),
      status: "OPEN",
      financialImpact: num(fd, "financialImpact") ?? 0,
      affectsEndDate: bool(fd, "affectsEndDate"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateIssueStatusAction(issueId: string, projectId: string, status: string) {
  await requireUser();
  await prisma.issue.update({ where: { id: issueId }, data: { status } });
  revalidatePath(`/projects/${projectId}`);
}

export async function updateIssueAction(issueId: string, projectId: string, fd: FormData) {
  await requireUser();
  await prisma.issue.update({
    where: { id: issueId },
    data: {
      description: str(fd, "description"),
      category: str(fd, "category"),
      priority: str(fd, "priority"),
      plannedSolution: str(fd, "plannedSolution"),
      dueDate: dateOrNull(fd, "dueDate"),
      financialImpact: num(fd, "financialImpact"),
      affectsEndDate: bool(fd, "affectsEndDate"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}
