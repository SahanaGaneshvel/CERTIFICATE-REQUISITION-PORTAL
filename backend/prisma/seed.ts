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
      institution: 'Hindustan Institute of Technology and Science, Chennai',
      role: 'ADMIN',
      isRegistered: true,
    },
  });

  const studentDobHash = await bcrypt.hash('15-03-2005', 10);
  await prisma.user.upsert({
    where: { registerNo: '24CU0310001' },
    update: {},
    create: {
      registerNo: '24CU0310001',
      passwordHash: studentDobHash,
      name: 'Vijay Bala Mahalingam',
      dateOfBirth: '15-03-2005',
      degree: 'B.Tech',
      branch: 'Computer Science and Engineering',
      campus: 'Chennai',
      gender: 'Male',
      admittedYear: 2024,
      institution: 'Hindustan Institute of Technology and Science, Chennai',
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
