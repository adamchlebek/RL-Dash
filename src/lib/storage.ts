import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'replays';

export async function uploadReplayToStorage(file: Buffer, fileName: string, ballchasingId: string): Promise<string> {
    const filePath = fileName;
    
    // Check if file already exists in root folder
    const { data: existingFile } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
            search: fileName
        });

    const uploadOptions = {
        contentType: 'application/octet-stream',
        metadata: {
            'ballchasing-id': ballchasingId,
            'original-filename': fileName,
            'uploaded-at': new Date().toISOString(),
        },
        // Don't overwrite if file exists
        upsert: existingFile && existingFile.length > 0 ? false : true
    };

    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, uploadOptions);

    if (error) {
        // If file already exists, return the existing path
        if (error.message.includes('already exists')) {
            console.log(`File already exists in storage: ${filePath}`);
            return filePath;
        }
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

export async function deleteReplayFromStorage(filePath: string): Promise<void> {
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

    if (error) {
        throw new Error(`Failed to delete from Supabase Storage: ${error.message}`);
    }
}

export async function createStorageBucket(): Promise<void> {
    const { data: existingBucket } = await supabase.storage.getBucket(BUCKET_NAME);
    
    if (existingBucket) {
        console.log(`Bucket '${BUCKET_NAME}' already exists`);
        return;
    }

    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['application/octet-stream'],
        fileSizeLimit: 52428800 // 50MB in bytes
    });

    if (error) {
        throw new Error(`Failed to create storage bucket: ${error.message}`);
    }
    
    console.log(`Successfully created bucket '${BUCKET_NAME}'`);
}

export async function getFileInfo(filePath: string): Promise<{ exists: boolean; size?: number; lastModified?: string; metadata?: Record<string, unknown> }> {
    const fileName = filePath; // Since files are now in root folder
    
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .list('', {
            search: fileName
        });

    if (error || !data) {
        return { exists: false };
    }

    const file = data.find(f => f.name === fileName);
    if (!file) {
        return { exists: false };
    }

    return {
        exists: true,
        size: file.metadata?.size,
        lastModified: file.updated_at || file.created_at,
        metadata: file.metadata
    };
}
