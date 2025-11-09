// Mock AWS SDK S3 client and presigner
const mSend = jest.fn();
const mPut = jest.fn();

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send: mSend })),
  PutObjectCommand: jest.fn((input) => ({ input })),
  GetObjectCommand: jest.fn((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(async (_client, _cmd, _opts) => 'https://signed.example.com/invoices/inv-presign.pdf'),
}));

import { uploadInvoicePdf } from '@/lib/storage';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

describe('uploadInvoicePdf (S3 presign)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.AWS_S3_BUCKET = 'my-bucket';
    process.env.AWS_REGION = 'eu-west-1';
    process.env.S3_PUBLIC = 'false';
  });

  afterEach(() => {
    delete process.env.AWS_S3_BUCKET;
    delete process.env.AWS_REGION;
    delete process.env.S3_PUBLIC;
  });

  test('uploads to S3 and returns presigned URL', async () => {
    const buf = Buffer.from('PDF');
    const url = await uploadInvoicePdf(buf, 'inv-presign.pdf');

    expect(PutObjectCommand).toHaveBeenCalled();
    expect(GetObjectCommand).toHaveBeenCalled();
    expect(getSignedUrl).toHaveBeenCalled();
    expect(S3Client).toHaveBeenCalled();
    expect(url).toBe('https://signed.example.com/invoices/inv-presign.pdf');
  });
});
