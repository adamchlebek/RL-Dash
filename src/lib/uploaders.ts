import { prisma } from "@/lib/prisma";
import { Uploader } from "@prisma/client";

export interface UploaderData {
  id: string;
  name: string;
  steamId: string;
  profileUrl?: string;
  avatar?: string;
}

export async function createOrUpdateUploader(
  uploaderData: UploaderData,
): Promise<Uploader | null> {
  if (!uploaderData) return null;

  try {
    // Check if uploader already exists by steamId
    const existingUploader = await prisma.uploader.findFirst({
      where: { steamId: uploaderData.steamId },
    });

    if (existingUploader) {
      // Update existing uploader
      return await prisma.uploader.update({
        where: { id: existingUploader.id },
        data: {
          name: uploaderData.name || existingUploader.name,
          profileUrl: uploaderData.profileUrl || existingUploader.profileUrl,
          avatar: uploaderData.avatar || existingUploader.avatar,
        },
      });
    } else {
      // Create new uploader
      return await prisma.uploader.create({
        data: {
          steamId: uploaderData.steamId,
          name: uploaderData.name,
          profileUrl: uploaderData.profileUrl,
          avatar: uploaderData.avatar,
        },
      });
    }
  } catch (error) {
    console.error("Error creating/updating uploader:", error);
    return null;
  }
}
