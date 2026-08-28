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
    where: { registerNo: '24CU0320018' },
    update: {},
    create: {
      registerNo: '24CU0320018',
      passwordHash: studentDobHash,
      name: 'Sahana G',
      dateOfBirth: '15-03-2005',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      campus: 'Padur',
      gender: 'Female',
      admittedYear: 2024,
      institution: 'Hindustan Institute of Engineering and Technology, Padur',
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
