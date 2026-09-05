import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      userRoles: {
        select: {
          role: { select: { name: true } },
        },
      },
      clientProfile: true,
    },
  });
  console.log("USERS COUNT:", users.length);
  users.forEach((u) => {
    console.log(`User: ${u.id} | ${u.email} | ${u.fullName} | Roles: ${u.userRoles.map((r) => r.role.name).join(", ")} | Profile: ${Boolean(u.clientProfile)}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
