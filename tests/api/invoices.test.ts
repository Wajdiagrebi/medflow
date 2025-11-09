// Tests for invoices route: ensure PDF is generated, uploaded, and invoice updated with pdfUrl

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => (_req: any, _res: any) => {}),
  getServerSession: jest.fn(async () => null),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    invoice: {
      create: jest.fn(async ({ data }: any) => ({ id: 'inv1', ...data })),
      update: jest.fn(async ({ where, data }: any) => ({ id: where.id, ...data })),
    },
  },
}));

jest.mock('@/lib/pdf', () => ({
  generateInvoicePdf: jest.fn(async (_invoice: any) => Buffer.from('PDF')),
}));

jest.mock('@/lib/storage', () => ({
  uploadInvoicePdf: jest.fn(async (_buffer: Buffer, _filename: string) => 'https://example.com/invoice-inv1.pdf'),
}));

jest.mock('@/lib/stripe', () => ({ createCheckoutSession: jest.fn(async () => ({ id: 'sess1', url: 'https://checkout' })) }));

import * as InvoicesRoute from '@/app/api/invoices/route';
import { prisma } from '@/lib/prisma';
import { generateInvoicePdf } from '@/lib/pdf';
import { uploadInvoicePdf } from '@/lib/storage';

describe('Invoices API', () => {
  beforeEach(() => jest.clearAllMocks());

  test('POST creates invoice, generates PDF, uploads it and saves pdfUrl', async () => {
    const body = { patientId: 'p1', amount: 50 };
    const req = new Request('http://localhost/api/invoices', { method: 'POST', body: JSON.stringify(body) });

    const res = await InvoicesRoute.POST(req as any);
    const json = await res.json();

    expect(prisma.invoice.create).toHaveBeenCalled();
    expect(generateInvoicePdf).toHaveBeenCalled();
    expect(uploadInvoicePdf).toHaveBeenCalled();
    expect(prisma.invoice.update).toHaveBeenCalled();
    // Ensure returned response includes url
    expect(json.url).toBeDefined();
    expect(json.invoice).toBeDefined();
  });
});
