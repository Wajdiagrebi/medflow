import PDFDocument from 'pdfkit';

// Generate a simple invoice PDF and return Buffer
export async function generateInvoicePdf(invoice: {
  id: string;
  clinicName?: string;
  patientName?: string;
  items?: { label: string; price: number }[];
  amount?: number;
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.fontSize(20).text(invoice.clinicName || 'Clinique', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice: ${invoice.id}`);
  doc.text(`Patient: ${invoice.patientName || 'N/A'}`);
  doc.moveDown();

  doc.fontSize(12).text('Items:');
  (invoice.items || []).forEach((it) => {
    doc.text(`${it.label} — ${it.price.toFixed(2)} TND`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: ${(invoice.amount || 0).toFixed(2)} TND`);

  doc.end();
  // Collect chunks emitted by the PDFDocument stream
  const buffers: Buffer[] = [];
  (doc as any).on('data', (chunk: Buffer) => buffers.push(Buffer.from(chunk)));

  await new Promise<void>((resolve) => (doc as any).on('end', () => resolve()));

  return Buffer.concat(buffers);
}
