"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { requireUser } from "./helpers";
import { saveUploadedFile } from "../upload";
import { supabaseStorage, STORAGE_BUCKET } from "../supabaseStorage";

export async function uploadDocumentAction(projectId: string, fd: FormData) {
  const user = await requireUser();
  const file = fd.get("file") as File | null;
  const category = String(fd.get("category") || "OTHER");
  if (!file || file.size === 0) return;

  const saved = await saveUploadedFile(file);
  if (!saved) return;

  await prisma.document.create({
    data: {
      projectId,
      category,
      name: saved.name,
      url: saved.url,
      uploadedById: user.id,
    },
  });
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteDocumentAction(documentId: string, projectId: string) {
  await requireUser();
  const doc = await prisma.document.delete({ where: { id: documentId } });

  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = doc.url.indexOf(marker);
  if (idx !== -1) {
    const objectPath = doc.url.slice(idx + marker.length);
    await supabaseStorage.storage.from(STORAGE_BUCKET).remove([objectPath]);
  }

  revalidatePath(`/projects/${projectId}`);
}
