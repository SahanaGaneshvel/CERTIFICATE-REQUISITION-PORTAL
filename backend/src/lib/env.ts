import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',

  minioEndpoint: required('MINIO_ENDPOINT'),
  minioPort: Number(process.env.MINIO_PORT ?? 9000),
  minioUseSSL: process.env.MINIO_USE_SSL === 'true',
  minioAccessKey: required('MINIO_ACCESS_KEY'),
  minioSecretKey: required('MINIO_SECRET_KEY'),
  minioBucket: process.env.MINIO_BUCKET ?? 'certificate-portal',

  paymentGatewayCallbackSecret: process.env.PAYMENT_GATEWAY_CALLBACK_SECRET ?? '',
};
