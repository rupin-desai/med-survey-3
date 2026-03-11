import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const accelerateUrl = process.env.STORAGE_URL;

  if (!accelerateUrl) {
    throw new Error("STORAGE_URL environment variable is not set");
  }

  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    accelerateUrl,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

// Export as a getter to avoid instantiation at import time
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[prop];
  },
});

export default prisma;
