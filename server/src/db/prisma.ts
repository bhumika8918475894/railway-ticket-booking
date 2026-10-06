import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL || (!process.env.DATABASE_URL.startsWith('file:') && !process.env.DATABASE_URL.startsWith('postgres'))) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

export const prisma = new PrismaClient();
