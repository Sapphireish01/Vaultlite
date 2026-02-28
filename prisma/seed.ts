// prisma/seed.ts
// Run with: npm run db:seed
// This creates a test user so you can log in immediately without registering.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash the password — NEVER store plain text passwords
  const passwordHash = await bcrypt.hash("password123", 12);
  // The '12' is the "salt rounds" — higher = slower but more secure

  // Create test user with a wallet
  const user = await prisma.user.upsert({
    where: { email: "test@vaultlite.com" },
    update: {},
    create: {
      email: "test@vaultlite.com",
      name: "Ada Okonkwo",
      passwordHash,
      wallet: {
        create: {
          balanceKobo: 250_000_00, // ₦250,000.00 starting balance
          monthlyLimitKobo: 500_000_00,
          currency: "NGN",
          // Seed some transactions so the history isn't empty
          transactions: {
            createMany: {
              data: [
                {
                  type: "CREDIT",
                  amountKobo: 300_000_00,
                  description: "Initial deposit",
                  category: "Deposit",
                  balanceAfterKobo: 300_000_00,
                  createdAt: new Date("2025-01-01"),
                },
                {
                  type: "DEBIT",
                  amountKobo: 15_000_00,
                  description: "Electricity bill",
                  category: "Utilities",
                  balanceAfterKobo: 285_000_00,
                  createdAt: new Date("2025-01-05"),
                },
                {
                  type: "DEBIT",
                  amountKobo: 8_500_00,
                  description: "Groceries - Shoprite",
                  category: "Food",
                  balanceAfterKobo: 276_500_00,
                  createdAt: new Date("2025-01-10"),
                },
                {
                  type: "CREDIT",
                  amountKobo: 50_000_00,
                  description: "Freelance payment",
                  category: "Income",
                  balanceAfterKobo: 326_500_00,
                  createdAt: new Date("2025-01-15"),
                },
                {
                  type: "DEBIT",
                  amountKobo: 76_500_00,
                  description: "Rent payment",
                  category: "Housing",
                  balanceAfterKobo: 250_000_00,
                  createdAt: new Date("2025-01-20"),
                },
              ],
            },
          },
        },
      },
    },
  });

  console.log(`✅ Created user: ${user.email}`);
  console.log(`   Password: password123`);
  console.log(`   Balance: ₦250,000.00`);
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
