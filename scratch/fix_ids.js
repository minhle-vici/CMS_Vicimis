const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current Users:', users.map(u => ({ id: u.id, name: u.name })));

  // Re-map websites based on names from the info field or similar
  const websites = await prisma.website.findMany();
  
  for (const site of websites) {
    let briefId = null;
    let assignId = null;

    if (site.info.includes('bởi Nhi')) briefId = users.find(u => u.name === 'Nhi')?.id;
    if (site.info.includes('bởi Huyền')) briefId = users.find(u => u.name === 'Huyền')?.id;
    if (site.info.includes('bởi Phương')) briefId = users.find(u => u.name === 'Phương')?.id;
    if (site.info.includes('bởi Mai')) briefId = users.find(u => u.name === 'Mai')?.id;
    if (site.info.includes('bởi Gia')) briefId = users.find(u => u.name === 'Gia')?.id;

    if (site.info.includes('Giao cho Minh')) assignId = users.find(u => u.name === 'Minh')?.id;
    if (site.info.includes('Giao cho Quân')) assignId = users.find(u => u.name === 'Quân')?.id;

    await prisma.website.update({
      where: { id: site.id },
      data: {
        briefById: briefId || site.briefById,
        assignedToId: assignId || site.assignedToId
      }
    });
  }
  console.log('✅ Re-mapped websites to new User IDs.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
