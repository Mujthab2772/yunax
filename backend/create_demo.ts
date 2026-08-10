import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'demo@yunax.com';
  const existing = await prisma.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log('Customer demo account exists:', email);
    // Reset password to demo123 just to be safe
    const passwordHash = await bcrypt.hash('demo123', 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
    return;
  }
  
  const passwordHash = await bcrypt.hash('demo123', 10);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Demo Customer',
      role: 'customer'
    }
  });
  console.log('Created customer demo account:', email);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
