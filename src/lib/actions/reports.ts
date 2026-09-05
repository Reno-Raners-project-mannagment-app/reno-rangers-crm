"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { str, num, dateOrNull, bool, requireUser } from "./helpers";

export async function createDailyReportAction(projectId: string, fd: FormData) {
  const user = await requireUser();
  const workDone = str(fd, "workDone");
  if (!workDone) return;

  await prisma.dailyReport.create({
    data: {
      projectId,
      date: dateOrNull(fd, "date") ?? new Date(),
      authorId: user.id,
      workersPresent: str(fd, "workersPresent"),
      hoursWorked: num(fd, "hoursWorked"),
      workDone,
      materialsUsed: str(fd, "materialsUsed"),
      materialsRunningLow: str(fd, "materialsRunningLow"),
      issuesFound: str(fd, "issuesFound"),
      planForTomorrow: str(fd, "planForTomorrow"),
      hasDelay: bool(fd, "hasDelay"),
      needsManagerDecision: bool(fd, "needsManagerDecision"),
    },
  });
  revalidatePath(`/projects/${projectId}`);
}
