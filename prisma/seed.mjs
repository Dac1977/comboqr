import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const institution = await prisma.institution.upsert({
    where: { id: "seed-institution" },
    update: {},
    create: { id: "seed-institution", name: "Institución Demo" },
  });

  const platform = await prisma.institution.upsert({
    where: { id: "seed-platform" },
    update: {},
    create: { id: "seed-platform", name: "ComboQR" },
  });

  const superHash = await bcrypt.hash("super123", 10);
  await prisma.user.upsert({
    where: { email: "super@comboqr.com" },
    update: {},
    create: {
      email: "super@comboqr.com",
      name: "Super Admin",
      passwordHash: superHash,
      role: "SUPERADMIN",
      institutionId: platform.id,
    },
  });

  const adminHash = await bcrypt.hash("admin123", 10);
  const scannerHash = await bcrypt.hash("scanner123", 10);

  await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Administrador",
      passwordHash: adminHash,
      role: "ADMIN",
      institutionId: institution.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "scanner@demo.com" },
    update: {},
    create: {
      email: "scanner@demo.com",
      name: "Escáner",
      passwordHash: scannerHash,
      role: "SCANNER",
      institutionId: institution.id,
    },
  });

  console.log("Seed OK:");
  console.log("  super@comboqr.com / super123 (crea instituciones)");
  console.log("  admin@demo.com / admin123   (crea combos y escanea)");
  console.log("  scanner@demo.com / scanner123 (solo escanea)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
