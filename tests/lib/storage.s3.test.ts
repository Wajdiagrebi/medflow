// Mock AWS SDK S3 client
const mSend = jest.fn();
const mPut = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: mSend })),
  PutObjectCommand: jest.fn((input) => ({ input })),
}));

import { uploadInvoicePdf } from '@/lib/storage';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

describe('uploadInvoicePdf (S3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET = 'my-bucket';
    process.env.AWS_REGION = 'eu-west-1';
    process.env.S3_PUBLIC = 'true';
  });

  afterEach(() => {
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_REGION;
    delete process.env.S3_PUBLIC;
  });

  test('uploads to S3 and returns public URL', async () => {
    const buf = Buffer.from('PDF');
    const url = await uploadInvoicePdf(buf, 'inv-test.pdf');

    expect(PutObjectCommand).toHaveBeenCalled();
    expect(S3Client).toHaveBeenCalled();
    expect(url).toBe('https://my-bucket.s3.eu-west-1.amazonaws.com/invoices/inv-test.pdf');
  });
});
