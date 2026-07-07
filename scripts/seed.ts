import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "../src/lib/auth";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const passwordHash = await hashPassword("password123");

    const user = await prisma.user.upsert({
      where: { email: "demo@legalos.com" },
      update: {},
      create: {
        email: "demo@legalos.com",
        passwordHash,
        name: "Demo User",
        role: "USER",
      },
    });

    const lawyer = await prisma.user.upsert({
      where: { email: "maya@legalos.com" },
      update: {},
      create: {
        email: "maya@legalos.com",
        passwordHash,
        name: "Maya Patel",
        role: "LAWYER",
      },
    });

    await prisma.lawyerProfile.upsert({
      where: { userId: lawyer.id },
      update: {},
      create: {
        userId: lawyer.id,
        verificationStatus: "PENDING",
        practiceArea: "Commercial Contracts",
        country: "UK",
        language: "English",
        rating: 4.9,
        experienceYears: 12,
        hourlyRate: 280,
        bio: "Commercial contracts specialist",
      },
    });

    const admin = await prisma.user.upsert({
      where: { email: "admin@legalos.com" },
      update: {},
      create: {
        email: "admin@legalos.com",
        passwordHash,
        name: "Admin User",
        role: "ADMIN",
      },
    });

    console.log("✓ Seeded database:");
    console.log(`  - User: ${user.email}`);
    console.log(`  - Lawyer: ${lawyer.email}`);
    console.log(`  - Admin: ${admin.email}`);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

main().finally(async () => {
  await prisma.$disconnect();
});
