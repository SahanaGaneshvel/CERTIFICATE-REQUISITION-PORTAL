import { Client } from 'minio';
import { v4 as uuid } from 'uuid';
import { env } from './env';

export const minioClient = new Client({
  endPoint: env.minioEndpoint,
  port: env.minioPort,
  useSSL: env.minioUseSSL,
  accessKey: env.minioAccessKey,
  secretKey: env.minioSecretKey,
});

export async function ensureBucket() {
  const exists = await minioClient.bucketExists(env.minioBucket).catch(() => false);
  if (!exists) {
    await minioClient.makeBucket(env.minioBucket);
  }
}

export async function uploadBuffer(
  folder: string,
  originalName: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const key = `${folder}/${uuid()}.${ext}`;
  await minioClient.putObject(env.minioBucket, key, buffer, buffer.length, {
    'Content-Type': mimeType,
  });
  return key;
}

export async function getDownloadUrl(key: string): Promise<string> {
  return minioClient.presignedGetObject(env.minioBucket, key, 60 * 10);
}

export async function deleteObject(key: string): Promise<void> {
  await minioClient.removeObject(env.minioBucket, key);
}
