import { supabase } from "@/integrations/supabase/client";

const BUCKET = "profiles";

/**
 * Uploads an image to Supabase Storage and returns its public URL.
 * Works on web and in the native WebViews (iOS/Android) — the caller just
 * passes a File from an <input type="file">. Files are stored under the
 * user's own folder so RLS restricts writes to self.
 *
 * `kind` is a label like "avatar" or "cover" used in the file name.
 */
export async function uploadImage(file: File, userId: string, kind: string): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type || "image/jpeg",
    cacheControl: "3600",
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
