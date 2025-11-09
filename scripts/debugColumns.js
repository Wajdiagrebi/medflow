const { PrismaClient } = require("@prisma/client");

(async () => {
  const prisma = new PrismaClient();
  try {
    const apptCols = await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name='Appointment' ORDER BY column_name"
    );
    const patientCols = await prisma.$queryRawUnsafe(
      "SELECT column_name FROM information_schema.columns WHERE table_name='Patient' ORDER BY column_name"
    );
    console.log("Appointment columns:", apptCols);
    console.log("Patient columns:", patientCols);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();


