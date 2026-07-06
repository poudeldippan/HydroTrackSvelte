import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ 
  connectionString: env.DATABASE_URL,
  ssl: true
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });
