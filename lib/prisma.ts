import { PrismaClient } from '@prisma/client'

// Ensure the PrismaClient is instantiated only once during development
// to avoid exhausting database connections when hot reloading.
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error', 'warn'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
