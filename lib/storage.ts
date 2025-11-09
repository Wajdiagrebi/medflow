import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Upload invoice PDF to S3 when configured, otherwise write to public/invoices.
// If the S3 bucket is private (S3_PUBLIC !== 'true'), upload and return a presigned GET URL.
export async function uploadInvoicePdf(buffer: Buffer, filename: string) {
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET;
  if (bucket) {
    const region = process.env.AWS_REGION || process.env.S3_REGION || 'us-east-1';
    const client = new S3Client({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    const key = `invoices/${filename}`;
    const isPublic = (process.env.S3_PUBLIC || process.env.AWS_S3_PUBLIC || '').toLowerCase() === 'true';

    const putParams: any = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    };

    if (isPublic) putParams.ACL = 'public-read';

    await client.send(new PutObjectCommand(putParams));

    if (isPublic) {
      const endpoint = process.env.AWS_S3_ENDPOINT;
      if (endpoint) return `${endpoint.replace(/\/$/, '')}/${key}`;
      if (region === 'us-east-1') return `https://${bucket}.s3.amazonaws.com/${key}`;
      return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    }

    // Private bucket: generate a presigned GET URL
    const ttl = Number(process.env.S3_PRESIGN_TTL) || 60 * 60 * 24 * 7; // default 7 days
    const getCmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    const signedUrl = await getSignedUrl(client, getCmd, { expiresIn: ttl });
    return signedUrl;
  }

  // Local fallback
  const publicDir = path.join(process.cwd(), 'public', 'invoices');
  await fs.promises.mkdir(publicDir, { recursive: true });
  const filepath = path.join(publicDir, filename);
  await fs.promises.writeFile(filepath, buffer);

  const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/invoices/${encodeURIComponent(filename)}`;
}
