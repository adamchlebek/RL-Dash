import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'replays';

export async function uploadReplayToStorage(file: Buffer, fileName: string, ballchasingId: string): Promise<string> {
    const filePath = `${ballchasingId}/${fileName}`;
    
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            contentType: 'application/octet-stream',
            metadata: {
                'ballchasing-id': ballchasingId,
                'original-filename': fileName,
            },
        });

    if (error) {
        throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
    }
    
    return data.path;
}

export function getStorageFileUrl(filePath: string): string {
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
    
    return data.publicUrl;
}
