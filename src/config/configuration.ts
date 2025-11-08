import { registerAs } from '@nestjs/config';

type NodeEnv = 'development' | 'test' | 'production';

export default registerAs('app', () => ({
  nodeEnv: (process.env.NODE_ENV ?? 'development') as NodeEnv,
  port: parseInt(process.env.PORT ?? '3000', 10),
  jwt: {
    secret: process.env.JWT_SECRET ?? 'changeme',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/smart-shop',
  storagePath: process.env.UPLOAD_PATH ?? 'uploads',
}));
