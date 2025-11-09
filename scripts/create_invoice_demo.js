const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

(async function main(){
  const prisma = new PrismaClient();
  try{
    const invoice = await prisma.invoice.create({
      data: {
        clinicId: 'clinic-demo',
        patientId: 'patient1',
        amount: 50,
        status: 'PENDING'
      }
    });

    // generate a simple pdf
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const publicDir = path.join(process.cwd(), 'public', 'invoices');
    await fs.promises.mkdir(publicDir, { recursive: true });
    const filename = `invoice-${invoice.id}.pdf`;
    const filepath = path.join(publicDir, filename);
    const stream = fs.createWriteStream(filepath);
    doc.fontSize(20).text('Clinique Demo', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Invoice: ${invoice.id}`);
    doc.text(`Patient: patient1`);
    doc.moveDown();
    doc.text('Items:');
    doc.text(`- Demo service — 50.00`);
    doc.moveDown();
    doc.fontSize(14).text(`Total: 50.00 TND`);
    doc.end();
    doc.pipe(stream);

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
    const url = `${base.replace(/\/$/, '')}/invoices/${encodeURIComponent(filename)}`;

    // update invoice with pdfUrl
    await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfUrl: url } });

    console.log(JSON.stringify({ invoice: { id: invoice.id, amount: invoice.amount, pdfUrl: url } }, null, 2));
  }catch(e){
    console.error(e);
    process.exit(1);
  }finally{
    await prisma.$disconnect();
  }
})();
