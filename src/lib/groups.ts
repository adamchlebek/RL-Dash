import { prisma } from "@/lib/prisma";
import { ReplayGroup } from "@prisma/client";

export async function createOrUpdateGroup(
  groupData: Record<string, unknown>,
): Promise<ReplayGroup | null> {
  if (!groupData) return null;

  try {
    // Check if group already exists by ballchasingId
    const existingGroup = await prisma.replayGroup.findUnique({
      where: { ballchasingId: groupData.id as string },
    });

    if (existingGroup) {
      // Group already exists, return it
      return existingGroup;
    } else {
      // Create new group
      return await prisma.replayGroup.create({
        data: {
          ballchasingId: groupData.id as string,
          name: (groupData.name as string) || (groupData.id as string),
          link: groupData.link as string,
        },
      });
    }
  } catch (error) {
    console.error("Error creating/updating group:", error);
    return null;
  }
}
