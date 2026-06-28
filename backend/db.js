const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL не задан. Проверь backend/.env');
}

const pool = new Pool({
  connectionString,
});

pool.on('error', (error) => {
  console.error('Ошибка PostgreSQL pool:', error);
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
});

prisma.$pgPool = pool;

module.exports = prisma;