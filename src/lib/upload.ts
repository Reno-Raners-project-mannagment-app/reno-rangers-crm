import { randomUUID } from "crypto";
import path from "path";
import { supabaseStorage, STORAGE_BUCKET } from "./supabaseStorage";

// Uploads to Supabase Storage (not local disk) so files survive across
// devices/deploys and work on serverless hosts (e.g. Vercel) whose
// filesystem is read-only/ephemeral at runtime.
export async function saveUploadedFile(file: File): Promise<{ url: string; name: string } | null> {
  if (!file || file.size === 0) return null;

  const ext = path.extname(file.name) || "";
  const objectPath = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseStorage.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, buffer, { contentType: file.type || undefined, upsert: false });

  if (error) {
    throw new Error(`Не вдалося завантажити файл у Supabase Storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabaseStorage.storage.from(STORAGE_BUCKET).getPublicUrl(objectPath);
  return { url: publicUrlData.publicUrl, name: file.name };
}
