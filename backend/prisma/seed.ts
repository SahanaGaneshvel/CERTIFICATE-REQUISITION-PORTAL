import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPasswordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { registerNo: 'ADMIN001' },
    update: {},
    create: {
      registerNo: 'ADMIN001',
      passwordHash: adminPasswordHash,
      name: 'Admin Office',
      dateOfBirth: '',
      degree: '',
      branch: '',
      campus: '',
      gender: '',
      admittedYear: 0,
      institution: 'HITS',
      role: 'ADMIN',
      isRegistered: true,
    },
  });

  const studentDobHash = await bcrypt.hash('15-03-2005', 10);
  await prisma.user.upsert({
    where: { registerNo: 'RA2311003010079' },
    update: {},
    create: {
      registerNo: 'RA2311003010079',
      passwordHash: studentDobHash,
      name: 'Vijay Bala Mahalingam',
      dateOfBirth: '15-03-2005',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      campus: 'Kattankulathur',
      gender: 'Male',
      admittedYear: 2023,
      institution: 'Faculty of Engineering and Technology, Kattankulathur',
      role: 'STUDENT',
    },
  });

  console.log('Seed complete. Admin login: ADMIN001 / ChangeMe123!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
