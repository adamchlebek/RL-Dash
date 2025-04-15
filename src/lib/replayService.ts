import { Replay } from "@prisma/client";
import { prisma } from "./prisma";

export const getReplayService = {
  async getAllReplays(): Promise<Replay[]> {
    return await prisma.replay.findMany({
      orderBy: {
        uploadedAt: "desc",
      },
    });
  },
};
