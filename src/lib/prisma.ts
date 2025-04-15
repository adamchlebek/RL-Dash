import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export let prisma: PrismaClient;

// Check if we're running in a browser environment
if (typeof window === "undefined") {
  // Running on the server
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error", "warn"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  // Running in browser - provide a mock or throw error when accessed
  prisma = {} as PrismaClient;
}

// Function to check if database is accessible
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // First check if we're in a browser environment
    if (typeof window !== "undefined") {
      console.error("Cannot connect to database from browser environment");
      return false;
    }

    // Simple query to check connection
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

// Wrap Prisma operations with retry logic for handling Supabase permission errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  delay = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error;

      // Check if this is a Supabase permission error
      const isPermissionError =
        (error instanceof Error && "code" in error && error.code === "42501") ||
        (error instanceof Error &&
          error.message.includes("permission denied for schema public"));

      if (!isPermissionError || attempt === maxRetries) {
        throw error;
      }

      console.warn(
        `Supabase permission error, retrying (${attempt}/${maxRetries})...`,
      );

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}
