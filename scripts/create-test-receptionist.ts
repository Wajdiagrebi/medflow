// Script pour créer un compte réceptionniste de test
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Création du compte réceptionniste de test...');

  const clinic = await prisma.clinic.findFirst({
    where: { name: 'Clinique Demo' },
  });

  if (!clinic) {
    console.error('❌ Clinique Demo introuvable. Exécutez d\'abord le seed.');
    process.exit(1);
  }

  const receptionistPassword = await bcrypt.hash('receptionist123', 10);
  
  const receptionist = await prisma.user.upsert({
    where: { email: 'recep1@clinique.test' },
    update: {},
    create: {
      name: 'Réceptionniste Demo',
      email: 'recep1@clinique.test',
      password: receptionistPassword,
      role: 'RECEPTIONIST',
      clinicId: clinic.id,
    },
  });

  console.log('✅ Compte réceptionniste créé !');
  console.log('   Email: recep1@clinique.test');
  console.log('   Password: receptionist123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

