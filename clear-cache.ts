import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const result = await db.countryMarketTrend.deleteMany();
  console.log(`Cleared ${result.count} cached country trend rows.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
