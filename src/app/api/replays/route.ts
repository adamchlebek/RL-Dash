import { NextRequest, NextResponse } from 'next/server';
import { uploadReplay } from '@/lib/ballchasing';
import { prisma, checkDatabaseConnection } from '@/lib/prisma';
import { uploadReplayToStorage, createStorageBucket, getStorageFileUrl } from '@/lib/storage';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Read file as buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Ballchasing API
        const ballchasingResponse = await uploadReplay(buffer, file.name);

        // Upload to Supabase Storage
        let storageFilePath: string | null = null;
        try {
            // Ensure bucket exists before uploading
            await createStorageBucket();
            storageFilePath = await uploadReplayToStorage(buffer, file.name, ballchasingResponse.id);
            console.log(`Successfully uploaded replay to storage: ${storageFilePath}`);
        } catch (storageError) {
            console.error('Failed to upload to storage:', storageError);
        }

        // Check database connection
        const isDbConnected = await checkDatabaseConnection();

        let replayRecord;

        if (isDbConnected) {
            // Check if the replay already exists in our database by ballchasingId
            const existingReplay = await prisma.replay.findUnique({
                where: { ballchasingId: ballchasingResponse.id }
            });

            if (existingReplay) {
                // Update existing replay with storage file path if not already present
                if (!existingReplay.storageFilePath && storageFilePath) {
                    replayRecord = await prisma.replay.update({
                        where: { id: existingReplay.id },
                        data: { storageFilePath: storageFilePath }
                    });
                    console.log(`Updated existing replay with storage file path: ${storageFilePath}`);
                } else {
                    replayRecord = existingReplay;
                }
                console.log(
                    `Replay with ballchasingId ${ballchasingResponse.id} already exists in database`
                );
            } else {
                // Store in database
                replayRecord = await prisma.replay.create({
                    data: {
                        ballchasingId: ballchasingResponse.id,
                        fileName: file.name,
                        status: 'processing',
                        storageFilePath: storageFilePath
                    }
                });
            }
        } else {
            // Return just the Ballchasing data if DB is not available
            replayRecord = {
                id: crypto.randomUUID(),
                ballchasingId: ballchasingResponse.id,
                fileName: file.name,
                status: 'processing',
                uploadedAt: new Date(),
                processedAt: null,
                storageFilePath: storageFilePath
            };
            console.warn('Database connection failed, using in-memory record');
        }

        return NextResponse.json({
            id: replayRecord.id,
            ballchasingId: replayRecord.ballchasingId,
            fileName: replayRecord.fileName,
            status: replayRecord.status,
            uploadedAt: replayRecord.uploadedAt,
            storageFilePath: replayRecord.storageFilePath,
            storageUrl: replayRecord.storageFilePath ? getStorageFileUrl(replayRecord.storageFilePath) : null,
            isDuplicate: ballchasingResponse.isDuplicate || false
        });
    } catch (error) {
        console.error('Error uploading replay:', error);
        return NextResponse.json({ error: 'Failed to upload replay' }, { status: 500 });
    }
}
