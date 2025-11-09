const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
    const patients = await prisma.patient.findMany({ select: { id: true, name: true, email: true, age: true } });
    const clinics = await prisma.clinic.findMany({ select: { id: true, name: true } });
    console.log(JSON.stringify({ users, patients, clinics }, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
