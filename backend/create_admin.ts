import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  if (admins.length > 0) {
    console.log('Admins found:', admins.map(a => a.email));
  } else {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const newAdmin = await prisma.user.create({
      data: {
        email: 'admin@yunax.com',
        passwordHash,
        name: 'Super Admin',
        role: 'admin',
        isBanned: false
      }
    });
    console.log('Created new admin:', newAdmin.email, 'with password: admin123');
  }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
