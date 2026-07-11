import { supabase } from './supabase';

export type UploadBucket = 'avatars' | 'event-banners' | 'kyb-documents';

/**
 * Uploads a file to a Supabase Storage bucket and returns the public URL.
 * For private buckets (kyb-documents), returns the storage path instead.
 */
export async function uploadFile(
  file: File,
  bucket: UploadBucket,
  pathPrefix = ''
): Promise<string> {
  const ext = file.name.split('.').pop();
  const uniqueName = `${pathPrefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(uniqueName, file, { upsert: true });

  if (error) throw new Error(error.message);

  if (bucket === 'kyb-documents') {
    // Private bucket: return the storage path so it can be referenced later
    return data.path;
  }

  // Public bucket: get the permanent public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}
