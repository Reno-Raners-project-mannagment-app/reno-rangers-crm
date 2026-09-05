"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { bool, requireUser } from "./helpers";

const FIELDS = [
  "allWorkDone",
  "extraWorksConfirmed",
  "defectsFixed",
  "siteCleaned",
  "wasteAndContainerRemoved",
  "materialsToolsRemoved",
  "finalPhotosTaken",
  "clientInspectionDone",
  "handoverProtocolSigned",
  "finalInvoiceIssued",
  "finalPaymentReceived",
  "warrantyDocsHanded",
] as const;

export async function updateHandoverChecklistAction(projectId: string, fd: FormData) {
  await requireUser();
  const data = Object.fromEntries(FIELDS.map((f) => [f, bool(fd, f)]));

  const allDone = FIELDS.every((f) => data[f]);

  await prisma.handoverChecklist.upsert({
    where: { projectId },
    create: { projectId, ...data },
    update: data,
  });

  if (allDone) {
    await prisma.project.update({ where: { id: projectId }, data: { status: "COMPLETED", actualEndDate: new Date() } });
    await prisma.projectStatusHistory.create({ data: { projectId, status: "COMPLETED", note: "Усі пункти здачі проєкту виконано" } });
  }

  revalidatePath(`/projects/${projectId}`);
}
