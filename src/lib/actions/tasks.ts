"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, dateOrNull, requireUser } from "./helpers";

export async function createTaskAction(fd: FormData) {
  const user = await requireUser();
  const title = str(fd, "title");
  if (!title) return;

  const checklistRaw = str(fd, "checklist");
  const checklist = checklistRaw
    ? JSON.stringify(
        checklistRaw
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .map((label) => ({ label, done: false }))
      )
    : null;

  await prisma.task.create({
    data: {
      title,
      description: str(fd, "description"),
      relatedType: str(fd, "relatedType"),
      projectId: str(fd, "projectId") || null,
      materialId: str(fd, "materialId") || null,
      containerId: str(fd, "containerId") || null,
      workerId: str(fd, "workerId") || null,
      issueId: str(fd, "issueId") || null,
      assigneeId: str(fd, "assigneeId") || null,
      createdById: user.id,
      dueDate: dateOrNull(fd, "dueDate"),
      priority: str(fd, "priority") ?? "MEDIUM",
      status: "OPEN",
      checklist,
    },
  });
  revalidatePath("/tasks");
  const projectId = str(fd, "projectId");
  if (projectId) revalidatePath(`/projects/${projectId}`);
}

export async function updateTaskStatusAction(taskId: string, status: string) {
  await requireUser();
  const task = await prisma.task.update({ where: { id: taskId }, data: { status } });
  revalidatePath("/tasks");
  if (task.projectId) revalidatePath(`/projects/${task.projectId}`);
}

export async function toggleChecklistItemAction(taskId: string, index: number) {
  await requireUser();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task?.checklist) return;
  const items = JSON.parse(task.checklist) as { label: string; done: boolean }[];
  if (items[index]) items[index].done = !items[index].done;
  await prisma.task.update({ where: { id: taskId }, data: { checklist: JSON.stringify(items) } });
  revalidatePath("/tasks");
  if (task.projectId) revalidatePath(`/projects/${task.projectId}`);
}

export async function addTaskCommentAction(taskId: string, fd: FormData) {
  const user = await requireUser();
  const text = str(fd, "text");
  if (!text) return;
  await prisma.comment.create({ data: { taskId, authorId: user.id, text } });
  revalidatePath("/tasks");
}

export async function deleteTaskAction(taskId: string) {
  await requireUser();
  const task = await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/tasks");
  if (task.projectId) revalidatePath(`/projects/${task.projectId}`);
}
