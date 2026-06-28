require('dotenv').config();

const bcrypt = require('bcryptjs');
const prisma = require('../db');

async function main() {
  const adminPassword = await bcrypt.hash('admin12345', 10);
  const engineerPassword = await bcrypt.hash('engineer12345', 10);
  const analystPassword = await bcrypt.hash('analyst12345', 10);

  const admin = await prisma.user.upsert({
    where: {
      email: 'admin@consist.local',
    },
    update: {
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@consist.local',
      password: adminPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });

  const engineer = await prisma.user.upsert({
    where: {
      email: 'engineer@consist.local',
    },
    update: {
      password: engineerPassword,
      name: 'Инженер поддержки',
      role: 'ENGINEER',
    },
    create: {
      email: 'engineer@consist.local',
      password: engineerPassword,
      name: 'Инженер поддержки',
      role: 'ENGINEER',
    },
  });

  const analyst = await prisma.user.upsert({
    where: {
      email: 'analyst@consist.local',
    },
    update: {
      password: analystPassword,
      name: 'Аналитик',
      role: 'ANALYST',
    },
    create: {
      email: 'analyst@consist.local',
      password: analystPassword,
      name: 'Аналитик',
      role: 'ANALYST',
    },
  });

  console.log('✅ Пользователи созданы/обновлены:');
  console.log('ADMIN:', admin.email, 'пароль: admin12345');
  console.log('ENGINEER:', engineer.email, 'пароль: engineer12345');
  console.log('ANALYST:', analyst.email, 'пароль: analyst12345');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();

    if (prisma.$pgPool) {
      await prisma.$pgPool.end();
    }
  });