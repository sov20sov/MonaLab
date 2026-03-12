import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | null };

function createPrisma(): PrismaClient | null {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  try {
    const adapter = new PrismaPg({
      connectionString: url.trim(),
      ...(url.includes('sslmode=require') || url.includes('ssl=true') ? { ssl: { rejectUnauthorized: false } } : {}),
    });
    return new PrismaClient({ adapter });
  } catch {
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}
