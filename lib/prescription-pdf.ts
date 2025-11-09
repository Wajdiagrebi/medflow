import PDFDocument from 'pdfkit';

// Generate a prescription PDF and return Buffer
export async function generatePrescriptionPdf(prescription: {
  id: string;
  clinicName?: string;
  doctorName?: string;
  patientName?: string;
  patientAge?: number;
  medications?: string;
  instructions?: string;
  createdAt?: Date | string;
}) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Header
  doc.fontSize(20).text(prescription.clinicName || 'Clinique', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('ORDONNANCE MÉDICALE', { align: 'center', underline: true });
  doc.moveDown(2);

  // Date
  const date = prescription.createdAt 
    ? new Date(prescription.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('fr-FR');
  doc.fontSize(12).text(`Date: ${date}`, { align: 'right' });
  doc.moveDown();

  // Patient info
  doc.fontSize(14).text('Informations Patient:', { underline: true });
  doc.fontSize(12);
  doc.text(`Nom: ${prescription.patientName || 'N/A'}`);
  if (prescription.patientAge) {
    doc.text(`Âge: ${prescription.patientAge} ans`);
  }
  doc.moveDown();

  // Doctor info
  doc.fontSize(14).text('Médecin:', { underline: true });
  doc.fontSize(12).text(`Dr. ${prescription.doctorName || 'N/A'}`);
  doc.moveDown(2);

  // Medications
  doc.fontSize(14).text('Médicaments Prescrits:', { underline: true });
  doc.moveDown();
  doc.fontSize(12);
  
  if (prescription.medications) {
    // Si medications est une chaîne JSON, essayer de la parser
    try {
      const meds = JSON.parse(prescription.medications);
      if (Array.isArray(meds)) {
        meds.forEach((med: any, index: number) => {
          doc.text(`${index + 1}. ${med.name || med.medication || 'Médicament'}`);
          if (med.dosage) doc.text(`   Dosage: ${med.dosage}`);
          if (med.duration) doc.text(`   Durée: ${med.duration}`);
          if (med.frequency) doc.text(`   Fréquence: ${med.frequency}`);
          doc.moveDown(0.5);
        });
      } else {
        doc.text(prescription.medications);
      }
    } catch {
      // Si ce n'est pas du JSON, afficher comme texte
      doc.text(prescription.medications);
    }
  } else {
    doc.text('Aucun médicament prescrit');
  }

  doc.moveDown();

  // Instructions
  if (prescription.instructions) {
    doc.fontSize(14).text('Instructions:', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(prescription.instructions);
    doc.moveDown();
  }

  // Footer
  doc.moveDown(3);
  doc.fontSize(10).text('Signature du médecin:', { align: 'right' });
  doc.moveDown(2);
  doc.text('_________________________', { align: 'right' });

  doc.end();

  // Collect chunks emitted by the PDFDocument stream
  const buffers: Buffer[] = [];
  (doc as any).on('data', (chunk: Buffer) => buffers.push(Buffer.from(chunk)));

  await new Promise<void>((resolve) => (doc as any).on('end', () => resolve()));

  return Buffer.concat(buffers);
}

