import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    firmName: "Tradeify",
    planName: "Select 50K",
    startingBalance: 50000,
    drawdownType: "trailing",
    maxDrawdown: 2000,
    profitTarget: 3000,
    minTradingDays: 5,
  },
  {
    firmName: "Tradeify",
    planName: "Select 100K",
    startingBalance: 100000,
    drawdownType: "trailing",
    maxDrawdown: 3000,
    profitTarget: 6000,
    minTradingDays: 5,
  },
  {
    firmName: "Tradeify",
    planName: "Select 150K",
    startingBalance: 150000,
    drawdownType: "trailing",
    maxDrawdown: 4500,
    profitTarget: 9000,
    minTradingDays: 5,
  },
  {
    firmName: "Apex",
    planName: "50K Eval",
    startingBalance: 50000,
    drawdownType: "trailing",
    maxDrawdown: 2500,
    profitTarget: 3000,
    minTradingDays: 7,
  },
  {
    firmName: "Apex",
    planName: "100K Eval",
    startingBalance: 100000,
    drawdownType: "trailing",
    maxDrawdown: 3000,
    profitTarget: 6000,
    minTradingDays: 7,
  },
  {
    firmName: "Apex",
    planName: "150K Eval",
    startingBalance: 150000,
    drawdownType: "trailing",
    maxDrawdown: 5000,
    profitTarget: 9000,
    minTradingDays: 7,
  },
  {
    firmName: "TopStep",
    planName: "50K Combine",
    startingBalance: 50000,
    drawdownType: "trailing",
    maxDrawdown: 2000,
    profitTarget: 3000,
    minTradingDays: 5,
  },
  {
    firmName: "TopStep",
    planName: "100K Combine",
    startingBalance: 100000,
    drawdownType: "trailing",
    maxDrawdown: 3000,
    profitTarget: 6000,
    minTradingDays: 5,
  },
  {
    firmName: "TopStep",
    planName: "150K Combine",
    startingBalance: 150000,
    drawdownType: "trailing",
    maxDrawdown: 4500,
    profitTarget: 9000,
    minTradingDays: 5,
  },
];

async function main() {
  console.log("Seeding prop firm plans...");

  for (const plan of plans) {
    await prisma.propFirmPlan.upsert({
      where: {
        firmName_planName: {
          firmName: plan.firmName,
          planName: plan.planName,
        },
      },
      update: plan,
      create: plan,
    });
  }

  console.log(`Seeded ${plans.length} plans.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
