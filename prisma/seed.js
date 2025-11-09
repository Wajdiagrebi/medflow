// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1️⃣ Clinique
  const clinic = await prisma.clinic.upsert({
    where: { id: "clinic-demo" },
    update: {},
    create: {
      id: "clinic-demo",
      name: "Clinique Demo",
    },
  });

  // 2️⃣ Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@clinique.test" },
    update: {},
    create: {
      name: "Admin Demo",
      email: "admin@clinique.test",
      password: adminPassword,
      role: "ADMIN",
      clinicId: clinic.id,
    },
  });

  // 3️⃣ Docteurs
  const doctorPassword = await bcrypt.hash("doctor123", 10);

  const doctor1 = await prisma.user.upsert({
    where: { email: "doc1@clinique.test" },
    update: {},
    create: {
      name: "Dr. Smith",
      email: "doc1@clinique.test",
      password: doctorPassword,
      role: "DOCTOR",
      clinicId: clinic.id,
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: "doc2@clinique.test" },
    update: {},
    create: {
      name: "Dr. Jane",
      email: "doc2@clinique.test",
      password: doctorPassword,
      role: "DOCTOR",
      clinicId: clinic.id,
    },
  });

  // 4️⃣ Patients
  const patients = [
    { id: "patient1", name: "Patient One", email: "patient1@demo.test", age: 35, condition: "N/A" },
    { id: "patient2", name: "Patient Two", email: "patient2@demo.test", age: 40, condition: "N/A" },
    { id: "patient3", name: "Patient Three", email: "patient3@demo.test", age: 25, condition: "N/A" },
  ];

  await prisma.patient.createMany({
    data: patients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
      age: p.age,
        clinicId: clinic.id,
    })),
    skipDuplicates: true,
    });

 // 5️⃣ Rendez-vous
const appointments = [
  { patientId: "patient1", doctorEmail: "doc1@clinique.test", startTime: new Date(), endTime: new Date(Date.now() + 30 * 60 * 1000), status: "SCHEDULED" },
  { patientId: "patient2", doctorEmail: "doc2@clinique.test", startTime: new Date(), endTime: new Date(Date.now() + 30 * 60 * 1000), status: "SCHEDULED" },
  { patientId: "patient3", doctorEmail: "doc1@clinique.test", startTime: new Date(), endTime: new Date(Date.now() + 30 * 60 * 1000), status: "SCHEDULED" },
];

const doctors = await prisma.user.findMany({
  where: { email: { in: [...new Set(appointments.map(a => a.doctorEmail))] } },
  select: { id: true, email: true },
  });
const emailToDoctorId = Object.fromEntries(doctors.map(d => [d.email, d.id]));

await prisma.appointment.createMany({
  data: appointments
    .filter((a) => emailToDoctorId[a.doctorEmail])
    .map((a) => ({
      patientId: a.patientId,
      doctorId: emailToDoctorId[a.doctorEmail],
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
    })),
  skipDuplicates: true,
  });


  console.log("✅ Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

