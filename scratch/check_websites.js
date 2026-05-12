const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const websites = await prisma.website.findMany({
    include: { briefedBy: true, assignedTo: true }
  });
  console.log(JSON.stringify(websites, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
