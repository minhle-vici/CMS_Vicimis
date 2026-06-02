import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

export const prisma = globalForPrisma.prismaCMS || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaCMS = prisma
