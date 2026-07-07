import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hashPassword } from "../src/lib/auth";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the environment.");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
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

  console.log({ user, lawyer, admin });
}

main().finally(async () => {
  await prisma.$disconnect();
});
