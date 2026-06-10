import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findFirst();
  console.log(user);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
