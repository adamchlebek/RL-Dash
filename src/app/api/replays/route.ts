import { NextRequest, NextResponse } from "next/server";
import { uploadReplay } from "@/lib/ballchasing";
import { prisma, checkDatabaseConnection } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Read file as buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Ballchasing API
    const ballchasingResponse = await uploadReplay(buffer, file.name);

    // Check database connection
    const isDbConnected = await checkDatabaseConnection();

    let replayRecord;

    if (isDbConnected) {
      // Check if the replay already exists in our database by ballchasingId
      const existingReplay = await prisma.replay.findUnique({
        where: { ballchasingId: ballchasingResponse.id },
      });

      if (existingReplay) {
        // Return the existing replay record
        replayRecord = existingReplay;
        console.log(
          `Replay with ballchasingId ${ballchasingResponse.id} already exists in database`,
        );
      } else {
        // Store in database
        replayRecord = await prisma.replay.create({
          data: {
            ballchasingId: ballchasingResponse.id,
            fileName: file.name,
            status: "processing",
          },
        });
      }
    } else {
      // Return just the Ballchasing data if DB is not available
      replayRecord = {
        id: crypto.randomUUID(),
        ballchasingId: ballchasingResponse.id,
        fileName: file.name,
        status: "processing",
        uploadedAt: new Date(),
        processedAt: null,
      };
      console.warn("Database connection failed, using in-memory record");
    }

    return NextResponse.json({
      id: replayRecord.id,
      ballchasingId: replayRecord.ballchasingId,
      fileName: replayRecord.fileName,
      status: replayRecord.status,
      uploadedAt: replayRecord.uploadedAt,
      isDuplicate: ballchasingResponse.isDuplicate || false,
    });
  } catch (error) {
    console.error("Error uploading replay:", error);
    return NextResponse.json(
      { error: "Failed to upload replay" },
      { status: 500 },
    );
  }
}
